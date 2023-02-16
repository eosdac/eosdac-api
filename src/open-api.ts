export default {
	routePrefix: '/v1/eosdac/docs',
	exposeRoute: true,
	swagger: {
		info: {
			title: 'eosDAC API',
			description: 'API for running DACs',
			version: '1.0.0',
		},
		host: process.env.HOST_NAME,
		schemes: ['https'],
		consumes: ['application/json'],
		produces: ['application/json'],
	},
};
