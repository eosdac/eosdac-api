const { tokensOwnedSchema } = require('../schemas');

async function tokensOwned(fastify, request) {
	// console.log(request)
	return new Promise(async (resolve, reject) => {
		const db = fastify.mongo.db;
		const collection = db.collection('tokens');
		const account = request.query.account;

		const query = { acnt: account };

		const token_info = fastify.tokens();

		const tokens_res = [];
		const res = await collection.find(query);
		res.forEach(
			row => {
				// console.log(row);
				const ti = token_info.get(`${row.code}:${row.symbol}`);

				const token_data = {
					contract: row.code,
					symbol: row.symbol,
					precision: row.precision,
					logo: 'https://raw.githubusercontent.com/eoscafe/eos-airdrops/master/logos/placeholder.png',
					logo_lg:
						'https://raw.githubusercontent.com/eoscafe/eos-airdrops/master/logos/placeholder-lg.png',
					name: row.symbol,
				};
				if (ti) {
					token_data.logo = ti.logo;
					token_data.logo_lg = ti.logo_lg;
					token_data.name = ti.name;
				}

				tokens_res.push(token_data);
			},
			() => {
				// console.log(tokens_res);
				resolve(tokens_res);
			}
		);
	});
}

module.exports = function (fastify, opts, next) {
	fastify.get(
		'/tokens_owned',
		{
			schema: tokensOwnedSchema.GET,
		},
		async (request, reply) => {
			const res = await tokensOwned(fastify, request);
			reply.send({ results: res, count: res.length });
		}
	);
	next();
};
