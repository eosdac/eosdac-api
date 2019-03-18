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
            },
            "start_block": {
                description: 'Start block (inclusive)',
                type: 'integer'
            },
            "end_block": {
                description: 'End block (inclusive)',
                type: 'integer'
            }
        },
        required: ['account', 'contract']
    }
};
