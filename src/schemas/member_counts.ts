const memberCountsSchema = {
	description: 'Member Count',
	summary: 'Get count of members and the agree terms version',
	tags: ['v1'],
	querystring: {
		type: 'object',
		properties: {
			end_block: {
				description: 'End block (inclusive)',
				type: 'integer',
			},
		},
	},
};

module.exports = { GET: memberCountsSchema };
