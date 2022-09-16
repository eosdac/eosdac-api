const financialReportsSchema = {
	description: 'Financial Reports',
	summary:
		'Given a start and end date (and optional account), will return opening and closing balances as well as income and expenditure',
	tags: ['v1'],
	querystring: {
		type: 'object',
		properties: {
			account: {
				description: 'Account to fetch',
				type: 'string',
				minLength: 1,
				maxLength: 12,
			},
			start: {
				description: 'Start Date',
				type: 'integer',
			},
			end: {
				description: 'End Date',
				type: 'integer',
			},
		},
		required: ['start', 'end'],
	},
};

module.exports = { GET: financialReportsSchema };
