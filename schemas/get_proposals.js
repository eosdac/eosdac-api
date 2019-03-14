const getProposalsSchema = {
    description: 'Fetch worker proposals',
    summary: 'Fetch current worker proposals',
    tags: ['v1'],
    querystring: {
        type: 'object',
        properties: {
            "state": {
                description: 'Filter by current state',
                type: 'integer'
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
