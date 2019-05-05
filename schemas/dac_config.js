const dacConfigSchema = {
    description: 'Fetch DAC config',
    summary: 'Fetch current DAC configuration',
    tags: ['v1'],
    querystring: {}
};

module.exports = {GET: dacConfigSchema};