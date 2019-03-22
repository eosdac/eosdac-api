const votesTimelineSchema = {
    description: 'Votes Timeline',
    summary: 'Get timeline of votes for a particular account',
    tags: ['v1'],
    querystring: {
        type: 'object',
        properties: {
            "account": {
                description: 'Account to fetch',
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
        required: ['account']
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
                            "custodian": {
                                description: "Custodian",
                                type: "string"
                            },
                            "votes": {
                                description: "Number of votes",
                                type: "integer"
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

module.exports = {GET:votesTimelineSchema}