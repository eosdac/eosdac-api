const balanceTimelineSchema = {
    description: 'Balance Timeline',
    summary: 'Get timeline of token balance changes',
    tags: ['v1'],
    querystring: {
        type: 'object',
        properties: {
            "account": {
                description: 'Account to fetch',
                type: 'string',
                minLength: 1,
                maxLength: 12
            },
            "contract": {
                description: 'Contract',
                type: 'string',
                minLength: 1,
                maxLength: 12
            },
            "symbol": {
                description: 'Token Symbol',
                type: 'string',
                minLength: 1,
                maxLength: 7
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
        required: ['account', 'contract', 'symbol']
    },
    response: {
        200: {
            type: 'object',
            properties: {
                "results": {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            "block_num": {
                                description: "The block number",
                                type: "string"
                            },
                            "balance": {
                                description: "Balance at the block",
                                type: "string"
                            }
                        }
                    }
                },
                "count": {
                    type: "integer"
                }
            }
        }
    }
};

module.exports = {GET: balanceTimelineSchema};