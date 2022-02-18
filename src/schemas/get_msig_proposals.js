const getMsigProposalsSchema = {
    description: 'Fetch msig proposals',
    summary: 'Fetch current msig proposals',
    tags: ['v1'],
    querystring: {
        type: 'object',
        properties: {
            "status": {
                description: 'Filter by current status (0=cancelled, 1=open, 2=executed, 3=expired)',
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
            },
            "proposer": {
                description: 'Filter by proposing account',
                type: 'string'
            },
            "proposal_name": {
                description: 'Filter by proposal name',
                type: 'string'
            }
        },
        required: []
    }
};

module.exports = {GET: getMsigProposalsSchema};