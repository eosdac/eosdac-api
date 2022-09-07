const { proposalsCountsSchema } = require('../schemas');

async function proposalsCounts(fastify, request) {
	const get_count = async (collection, query) => {
		const res = await collection.find(query).sort({ block_num: -1 });
		return await res.count();
	};

	return new Promise(async (resolve, reject) => {
		const db = fastify.mongo.db;
		const collection = db.collection('workerproposals');
		const dac_id = 'eos.dac'; //request.dac();

		const account = request.query.account;

		const counts = {};
		try {
			if (account) {
				const inbox_query = {
					$or: [
						{ status: 0, approve_voted: { $ne: account } },
						{ status: 2, finalize_voted: { $ne: account } },
					],
					dac_id,
				};
				counts.inbox = await get_count(collection, inbox_query);
			}

			resolve(counts);
		} catch (e) {
			reject(e);
		}
	});
}

module.exports = function (fastify, opts, next) {
	fastify.get(
		'/proposals_counts',
		{
			schema: proposalsCountsSchema.GET,
		},
		async (request, reply) => {
			reply.send(await proposalsCounts(fastify, request));
		}
	);
	next();
};
