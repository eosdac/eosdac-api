const proposalsInboxSchema = {
	description: 'Fetch worker proposals inbox',
	summary:
		'Gets a list of worker proposals which require a particular users attention',
	tags: ['v1'],
	querystring: {
		type: 'object',
		properties: {
			account: {
				description: 'Filter by account',
				type: 'string',
			},
			limit: {
				description: 'Limit result count',
				type: 'integer',
			},
			skip: {
				description: 'Skip number of results',
				type: 'integer',
			},
		},
		required: ['account'],
	},
};

module.exports = { GET: proposalsInboxSchema };
