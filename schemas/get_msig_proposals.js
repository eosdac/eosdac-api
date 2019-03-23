const getMsigProposalsSchema = {
    description: 'Fetch msig proposals',
    summary: 'Fetch current msig proposals',
    tags: ['v1'],
    querystring: {
        type: 'object',
        properties: {
            "status": {
                description: 'Filter by current status',
                type: 'integer',
                enum: [0,1,2,3]
            },
            "limit": {
                description: 'Limit result count (1-100)',
                type: 'integer',
                maximum: 100,
                minimum: 1
            },
            "skip": {
                description: 'Skip number of results',
                type: 'integer'
            }
        },
        required: []
    }
};

module.exports = {GET: getMsigProposalsSchema};