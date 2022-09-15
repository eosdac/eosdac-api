const fp = require('fastify-plugin');

module.exports = fp(
	(fastify, options, next) => {
		fastify.decorate('config', options);

		next();
	},
	{
		fastify: '>=1.0.0',
		name: 'fastify-config',
	}
);
