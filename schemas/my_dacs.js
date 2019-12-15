const myDacsSchema = {
    description: 'My DACs',
    summary: 'Get a list of all DACs that this account is a member of',
    tags: ['v1'],
    querystring: {
        type: 'object',
        properties: {
            "account": {
                description: 'Filter by account',
                type: 'string'
            }
        },
        required: ['account']
    }
};

module.exports = {GET: myDacsSchema};