const proposalsCountsSchema = {
	description: 'Fetch worker proposals counts',
	summary: 'Gets counts for all proposals, grouped by status',
	tags: ['v1'],
	querystring: {
		type: 'object',
		properties: {
			account: {
				description: 'Filter by account',
				type: 'string',
			},
		},
		required: [],
	},
};

module.exports = { GET: proposalsCountsSchema };
