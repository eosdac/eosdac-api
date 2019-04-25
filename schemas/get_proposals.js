const getProposalsSchema = {
    description: 'Fetch worker proposals',
    summary: 'Fetch current worker proposals',
    tags: ['v1'],
    querystring: {
        type: 'object',
        properties: {
            "status": {
                description: 'Filter by current status',
                type: 'integer'
            },
            "arbitrator": {
                description: 'Filter by arbitrator',
                type: 'string'
            },
            "proposer": {
                description: 'Filter by proposer',
                type: 'string'
            },
            "limit": {
                description: 'Limit result count',
                type: 'integer'
            },
            "skip": {
                description: 'Skip number of results',
                type: 'integer'
            }
        },
        required: []
    }
};

module.exports = {GET: getProposalsSchema};