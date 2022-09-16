const referendumsSchema = {
	description: 'Get referendums',
	summary: 'Fetch referendums',
	tags: ['v1'],
	querystring: {
		type: 'object',
		properties: {
			status: {
				description: 'Status of referendum',
				type: 'integer',
			},
			limit: {
				description: 'Limit number of results',
				type: 'integer',
			},
			skip: {
				description: 'Skip number of results',
				type: 'integer',
			},
		},
		required: [],
	},
};

module.exports = { GET: referendumsSchema };
