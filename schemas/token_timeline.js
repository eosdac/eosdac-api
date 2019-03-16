const tokenTimelineSchema = {
    description: 'Token Timeline',
    summary: 'Get timeline of token balance changes',
    tags: ['v1'],
    querystring: {
        type: 'object',
        properties: {
            "account": {
                description: 'Account to fetch',
                type: 'string'
            },
            "contract": {
                description: 'Contract',
                type: 'string'
            },
            "symbol": {
                description: 'Token Symbol',
                type: 'string'
            }
        },
        required: ['account', 'contract']
    }
};
