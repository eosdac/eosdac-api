const fp = require('fastify-plugin');

module.exports = fp((fastify, options, next) => {
    fastify.decorateRequest('dac', function () {
        return this.headers['x-dac-name'] || 'eosdac';
    });

    next();
}, {
    fastify: '>=1.0.0',
    name: 'fastify-dac'
});
