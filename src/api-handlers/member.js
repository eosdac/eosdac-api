const { memberSchema } = require('../schemas');
const { NotFound } = require('http-errors');

const null_profile = {
	description: '',
	email: '',
	familyName: '',
	gender: '',
	givenName: '',
	image: '',
	sameAs: [],
	timezone: '0',
	url: '',
};

async function getMember(fastify, request) {
	const account = request.query.account;
	const accounts = account.split(',');

	const dac_config = await request.dac_config();
	const db = fastify.mongo.db;
	const collection = db.collection('actions');

	const cust_contract = dac_config.accounts.get(2);

	const query = {
		'action.account': cust_contract,
		'action.name': 'stprofileuns',
		'action.data.cand': { $in: accounts },
	};

	const pipeline = [
		{ $match: query },
		{ $sort: { block_num: -1 } },
		{
			$group: {
				_id: { cand: '$action.data.cand' },
				block_num: { $first: '$block_num' },
				profile: { $first: '$action.data.profile' },
				account: { $first: '$action.data.cand' },
			},
		},
		{ $sort: { block_num: -1 } },
		{
			$facet: {
				results: [{ $match: {} }],
				count: [{ $count: 'count' }],
			},
		},
	];

	const res = await collection.aggregate(pipeline);

	const found_accounts = [];
	const result = await res.next();
	result.results = result.results.map(row => {
		// console.log(row.profile)
		if (typeof row.profile === 'string') {
			row.profile = JSON.parse(row.profile);
		}
		delete row._id;

		found_accounts.push(row.account);

		return row;
	});

	const missing_accounts = [];
	accounts.forEach(account_name => {
		if (!found_accounts.includes(account_name)) {
			missing_accounts.push(account_name);
		}
	});

	accounts.forEach(account => {
		if (missing_accounts.includes(account)) {
			result.results.push({
				account,
				block_num: 0,
				profile: null_profile,
			});
		}
	});

	// console.log(missing_accounts)

	if (result.count.length) {
		result.count = result.results.length;
	}

	return result;
}

module.exports = function (fastify, opts, next) {
	fastify.get(
		'/member',
		{
			schema: memberSchema.GET,
		},
		async (request, reply) => {
			reply.send(await getMember(fastify, request));
		}
	);
	next();
};
