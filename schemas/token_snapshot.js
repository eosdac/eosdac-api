const tokenSnapshotSchema = {
    description: 'Token Snapshot',
    summary: 'Get snapshot of token holders at a specific block',
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
        required: ['contract']
    }
};

module.exports = {GET:tokenSnapshotSchema}