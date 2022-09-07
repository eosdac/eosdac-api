const { myDacsSchema } = require('../schemas');

async function myDacs(fastify, request) {
	const db = fastify.mongo.db;
	const account = request.query.account;

	const data_query = {
		account,
	};
	const collection = db.collection('memberstats');
	const res = await collection.find(data_query);

	const dacs = [];
	let row;
	while ((row = await res.next())) {
		delete row._id;
		dacs.push(row);
	}

	return { results: dacs, count: dacs.length };
}

module.exports = function (fastify, opts, next) {
	fastify.get(
		'/my_dacs',
		{
			schema: myDacsSchema.GET,
		},
		async (request, reply) => {
			reply.send(await myDacs(fastify, request));
		}
	);
	next();
};
