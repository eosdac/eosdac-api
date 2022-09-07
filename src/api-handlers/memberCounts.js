const { memberCountsSchema } = require('../schemas');

const MongoLong = require('mongodb').Long;

const { eosTableIter } = require('../eos-table');

async function memberCounts(fastify, request) {
	// console.log(request)
	return new Promise(async (resolve, reject) => {
		const api = fastify.eos.api;

		const dac_config = await request.dac_config();
		const token_contract = dac_config.symbol.contract;
		const dac_id = request.dac();

		const cust_req = {
			code: token_contract,
			scope: dac_id,
			table: 'members',
			api,
			greed_factor: 1,
			primary_key: 'sender',
		};

		const table_iter = new eosTableIter(cust_req);
		const results = new Map();
		results.set('total', 0);
		for await (let row of table_iter) {
			const key = `terms_v${row.agreedtermsversion}`;
			if (!results.has(key)) {
				results.set(key, 0);
			}
			results.set(key, results.get(key) + 1);
			results.set('total', results.get('total') + 1);
		}
		const res_obj = Array.from(results).reduce((obj, [key, value]) => {
			obj[key] = value;
			return obj;
		}, {});
		resolve(res_obj);
	});
}

module.exports = function (fastify, opts, next) {
	fastify.get(
		'/member_counts',
		{
			schema: memberCountsSchema.GET,
		},
		async (request, reply) => {
			const res = await memberCounts(fastify, request);
			reply.send({ results: res, count: res.length });
		}
	);
	next();
};
