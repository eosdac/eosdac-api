const dacInfoSchema = {
    description: 'Fetch DAC information',
    summary: 'Get information about a particular DAC, can supply either a dac_id or a symbol to query for.  This API call does not need an X-DAC-Name header',
    tags: ['v1'],
    querystring: {}
};

module.exports = {GET: dacInfoSchema};
