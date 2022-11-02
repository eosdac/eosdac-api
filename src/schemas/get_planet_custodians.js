const getPlanetCustodiansSchema = {
    description: 'Get planet custodians',
    tags: ['v1'],
    querystring: {
        type: 'object',
        properties: {
            "walletId": {
                type: 'string'
            },
        },
        required: ["walletId"]
    },
};

module.exports = {GET: getPlanetCustodiansSchema};
