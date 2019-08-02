const memberSnapshotSchema = {
    description: 'Member Snapshot',
    summary: 'Get snapshot of DAC members at a specific block',
    tags: ['v1'],
    querystring: {
        type: 'object',
        properties: {
            "contract": {
                description: 'Token Contract',
                type: 'string'
            },
            "symbol": {
                description: 'Token Symbol',
                type: 'string'
            },
            "block_num": {
                description: 'Block number (optional) - default: head',
                type: 'integer'
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
                        type: "object",
                        properties: {
                            "account": {
                                description: "The EOS account name",
                                type: "string"
                            },
                            "balance": {
                                description: "Balance at time of snapshot",
                                type: "array",
                                items: {
                                    "type": "string"
                                }
                            },
                            "terms": {
                                description: "Version of the terms agreed to",
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

module.exports = {GET: memberSnapshotSchema};