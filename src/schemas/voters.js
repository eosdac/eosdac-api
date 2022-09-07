const votersSchema = {
	description: 'Get Voters',
	summary: 'Get voters for a particular candidate',
	tags: ['v1'],
	querystring: {
		type: 'object',
		properties: {
			candidate: {
				description: 'Filter by candidate account',
				type: 'string',
			},
		},
		required: ['candidate'],
	},
};

module.exports = { GET: votersSchema };
