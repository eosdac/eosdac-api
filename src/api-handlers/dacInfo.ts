import { dacInfoSchema } from '../schemas';

async function getDacConfig(fastify, request) {
	return new Promise(async (resolve, reject) => {
		const db = fastify.mongo.db;
		const collection = db.collection('dacdirectory');
		const dac_id = request.query.dac_id;
		const symbol_code = request.query.symbol_code;
		const symbol_contract = request.query.symbol_contract;

		const query: any = {};
		if (symbol_code && symbol_contract) {
			query['symbol.code'] = symbol_code;
			query['symbol.contract'] = symbol_contract;
		} else if (dac_id) {
			query.dac_id = dac_id;
		} else {
			reject(
				`You must supply either dac_id or symbol_code and symbol_contract`
			);
		}

		const res = await collection.findOne(query);
		if (res) {
			delete res._id;

			resolve({ results: [res], count: 1 });
		} else {
			resolve({ results: [], count: 0 });
		}
	});
}

module.exports = function (fastify, opts, next) {
	fastify.get(
		'/dac_info',
		{
			schema: dacInfoSchema.GET,
		},
		async (request, reply) => {
			reply.send(await getDacConfig(fastify, request));
		}
	);
	next();
};
