const getProfileSchema = {
	description: 'Get user profile',
	summary: 'Fetches the user profile for a member',
	tags: ['v1'],
	params: {
		type: 'object',
		required: ['dacId'],
		properties: {
			dacId: {
				type: 'string',
				description: 'Organization name',
			},
		},
	},
	querystring: {
		type: 'object',
		properties: {
			account: {
				description:
					'Account to fetch, you can supply multiple accounts by separating them with a comma',
				type: 'string',
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
							account: {
								description: '',
								type: 'string',
								minLength: 1,
								maxLength: 12,
							},
							block_num: {
								description: '',
								type: 'integer',
							},
							member_type: {
								description: 'Type of member',
								type: 'integer',
							},
							profile: {
								description: '',
								type: 'object',
								properties: {
									description: {
										type: 'string',
									},
									email: {
										type: 'string',
									},
									familyName: {
										type: 'string',
									},
									gender: {
										type: 'string',
									},
									givenName: {
										type: 'string',
									},
									image: {
										type: 'string',
									},
									sameAs: {
										type: 'array',
										items: {
											type: 'object',
											properties: {
												link: {
													type: 'string',
												},
											},
										},
									},
									timezone: {
										type: 'string',
									},
									url: {
										type: 'string',
									},
								},
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

module.exports = { GET: getProfileSchema };
