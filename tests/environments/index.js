const { FastifyTestEnvironment } = require('./fastify.environment');

const createApiTestEnvironment = () => new FastifyTestEnvironment();

module.exports = { createApiTestEnvironment };
