const getPlanetCandidatesSchema = {
    description: 'Get planet candidates',
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

module.exports = {GET: getPlanetCandidatesSchema};
