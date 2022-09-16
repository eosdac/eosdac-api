const tokensOwnedSchema = {
	description: 'Tokens Owned',
	summary: 'Get list of tokens owned by a particular account',
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
		},
		required: ['account'],
	},
	response: {
		200: {
			type: 'object',
			properties: {
				results: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							contract: {
								description: 'Token Contract',
								type: 'string',
							},
							symbol: {
								description: 'Token Symbol',
								type: 'string',
							},
							precision: {
								description: 'Token Precision',
								type: 'integer',
							},
							name: {
								description: 'Token Name',
								type: 'string',
							},
							logo: {
								description: 'Logo URL',
								type: 'string',
							},
							logo_lg: {
								description: 'Logo URL (Large)',
								type: 'string',
							},
						},
					},
				},
				count: {
					type: 'integer',
				},
			},
		},
	},
};

module.exports = { GET: tokensOwnedSchema };
