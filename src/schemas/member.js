const memberSchema = {
    description: 'Get member information',
    summary: 'Get information about a member, including token balances, profile and votes',
    tags: ['v1'],
    querystring: {
        type: 'object',
        properties: {
            "account": {
                description: 'Account to fetch, you can supply multiple accounts by separating them with a comma',
                type: 'string'
            }
        },
        required: ['account']
    }
};

module.exports = {GET: memberSchema};
