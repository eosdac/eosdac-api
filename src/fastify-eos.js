const fp = require('fastify-plugin');

const { TextDecoder, TextEncoder } = require('text-encoding');
const { Api, JsonRpc } = require('@jafri/eosjs2');
const fetch = require('node-fetch');

module.exports = fp(
	(fastify, options, next) => {
		const rpc = new JsonRpc(options.eos.endpoint, { fetch });
		const api = new Api({
			rpc,
			signatureProvider: null,
			chainId: options.chainId,
			textDecoder: new TextDecoder(),
			textEncoder: new TextEncoder(),
		});

		fastify.decorate('eos', { api, rpc });

		next();
	},
	{
		fastify: '>=1.0.0',
		name: 'fastify-eos',
	}
);
