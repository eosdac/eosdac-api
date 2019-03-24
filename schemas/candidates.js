const candidatesSchema = {
    description: 'Get candidates',
    summary: 'Fetch current DAC candidates',
    tags: ['v1'],
    querystring: {
        type: 'object',
        properties: {
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

module.exports = {GET: candidatesSchema};