import { proposalsInboxSchema } from '../schemas';

async function proposalsInbox(fastify, request) {
	return new Promise(async (resolve, reject) => {
		const db = fastify.mongo.db;
		const collection = db.collection('workerproposals');
		const dac_id = request.dac();

		const account = request.query.account;
		const skip = request.query.skip || 0;
		const limit = request.query.limit || 30;

		const query = {
			$or: [
				{ status: 0, approve_voted: { $ne: account } },
				{ status: 2, finalize_voted: { $ne: account } },
			],
			dac_id,
		};

		const proposals = { results: [], count: 0 };

		try {
			const res = await collection
				.find(query)
				.sort({ block_num: -1 })
				.skip(skip)
				.limit(limit);
			const count = await res.count();

			if (count === 0) {
				resolve(proposals);
			} else {
				res.forEach(
					prop => {
						delete prop._id;
						proposals.results.push(prop);
					},
					() => {
						proposals.count = count;

						resolve(proposals);
					}
				);
			}
		} catch (e) {
			reject(e);
		}
	});
}

module.exports = function (fastify, opts, next) {
	fastify.get(
		'/proposals_inbox',
		{
			schema: proposalsInboxSchema.GET,
		},
		async (request, reply) => {
			reply.send(await proposalsInbox(fastify, request));
		}
	);
	next();
};
