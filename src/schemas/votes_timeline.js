const votesTimelineSchema = {
	description: 'Votes Timeline',
	summary: 'Get timeline of votes for a particular account',
	tags: ['v1'],
	querystring: {
		type: 'object',
		properties: {
			account: {
				description: 'Account to fetch',
				type: 'string',
			},
			start_block: {
				description: 'Start block (inclusive)',
				type: 'integer',
			},
			end_block: {
				description: 'End block (inclusive)',
				type: 'integer',
			},
		},
		required: ['account'],
	},
};

module.exports = { GET: votesTimelineSchema };
