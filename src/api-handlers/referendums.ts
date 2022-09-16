import { loadConfig } from '../functions';
import { referendumsSchema } from '../schemas';

async function getReferendums(fastify, request) {
	return new Promise(async (resolve, reject) => {
		const config = loadConfig();

		const db = fastify.mongo.db;
		const dac_id = request.dac();

		const coll = db.collection('referendums');
		const query: any = { dac_id };
		const status = request.query.status;
		const skip = request.query.skip || 0;
		const limit = request.query.limit || 20;
		if (status !== undefined) {
			query.status = status;
		}
		const res = await coll
			.find(query)
			.sort({ expires: -1 })
			.skip(parseInt(skip))
			.limit(parseInt(limit));

		const ret = [];
		res.forEach(
			row => {
				delete row._id;

				ret.push(row);
			},
			() => {
				resolve({ results: ret, count: ret.length });
			}
		);
	});
}

module.exports = function (fastify, opts, next) {
	fastify.get(
		'/referendums',
		{
			schema: referendumsSchema.GET,
		},
		async (request, reply) => {
			reply.send(await getReferendums(fastify, request));
		}
	);
	next();
};
