import { balanceTimelineSchema } from '../schemas';

import { Long as MongoLong } from 'mongodb';

async function balanceTimeline(fastify, request) {
	// console.log(request)
	return new Promise(async (resolve, reject) => {
		const dac_config = await request.dac_config();
		const db = fastify.mongo.db;
		const collection = db.collection('contract_rows');
		const account = request.query.account;
		const contract = request.query.contract || dac_config.accounts.get(4);
		const symbol = request.query.symbol || dac_config.symbol.split(',')[1];
		let start_block = request.query.start_block || null;
		const end_block = request.query.end_block || null;

		if (!start_block && !end_block) {
			// max 6 months
			const six_months = 2 * 60 * 60 * 24 * 90;
			const api = fastify.eos.api;
			const info_res = await api.rpc.get_info();
			start_block = Math.max(1, info_res.head_block_num - six_months);
		}

		const query: any = { code: contract, scope: account, table: 'accounts' };
		if (start_block) {
			if (!('block_num' in query)) {
				query.block_num = {};
			}
			query.block_num['$gte'] = new MongoLong(start_block);
		}
		if (end_block) {
			if (!('block_num' in query)) {
				query.block_num = {};
			}
			query.block_num['$lte'] = new MongoLong(end_block);
		}

		collection.find(query, { sort: { block_num: 1 } }, async (err, res) => {
			// console.log("action", res.action.data)
			if (err) {
				reject(err);
			} else if (res) {
				const timeline = [];
				if (!(await res.count())) {
					const zero_bal = `0 ${symbol}`;
					timeline.push({ block_num: 0, balance: zero_bal });
					resolve(timeline);
				} else {
					res.forEach(
						row => {
							const [bal, sym] = row.data.balance.split(' ');
							if (symbol === sym) {
								timeline.push({
									block_num: row.block_num,
									balance: row.data.balance,
								});
							}
						},
						async () => {
							const info = await fastify.eos.rpc.get_info();
							const lib = info.last_irreversible_block_num;

							const timeline_last = {
								block_num: lib,
								balance: timeline[timeline.length - 1].balance,
							};
							timeline.push(timeline_last);

							resolve(timeline);
						}
					);
				}
			}
		});
	});
}

module.exports = function (fastify, opts, next) {
	fastify.get(
		'/balance_timeline',
		{
			schema: balanceTimelineSchema.GET,
		},
		async (request, reply) => {
			const res: any = await balanceTimeline(fastify, request);
			reply.send({ results: res, count: res.length });
		}
	);
	next();
};
