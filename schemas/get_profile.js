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
    },
    response: {
        200: {
            type: 'object',
            properties: {
                "results": {
                    type: "array",
                    items: {
                        type: 'string'
                    }
                },
                "count": {
                    type: "integer"
                }
            }
        }
    }
};

module.exports = {GET:getProfileSchema}
