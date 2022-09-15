import { Api, JsonRpc } from '@jafri/eosjs2';

import fp = require('fastify-plugin');
import fetch from 'node-fetch';
import { TextDecoder, TextEncoder } from 'text-encoding';

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
