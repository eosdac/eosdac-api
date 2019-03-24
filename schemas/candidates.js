const candidatesSchema = {
    description: 'Get candidates',
    summary: 'Fetch current DAC candidates',
    tags: ['v1'],
    querystring: {}
};

module.exports = {GET: candidatesSchema};