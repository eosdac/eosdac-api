const getProfileSchema = {
    description: 'Get user profile',
    summary: 'Fetches the user profile for a member',
    tags: ['v1'],
    querystring: {
        type: 'object',
        properties: {
            "account": {
                description: 'Account to fetch',
                type: 'string'
            }
        },
        required: []
    }
};
