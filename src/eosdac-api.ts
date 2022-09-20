#!/usr/bin/env node

process.title = 'eosdac-api';

import fastify, { FastifyInstance } from 'fastify';
import { IncomingMessage, Server, ServerResponse } from 'http';

import { config } from './config';
import { logger } from './connections/logger';

import fastifyOAS = require('fastify-oas');

const openApi = require('./open-api');

logger('eosdac-api', config.logger);

export const buildAPIServer = async () => {
	const api: FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify(
		{
			ignoreTrailingSlash: true,
			trustProxy: true,
			logger: true,
		}
	);

	const prefix = '/v1/eosdac';

	api.register(require('./api-handlers/balanceTimeline'), { prefix });
	api.register(require('./api-handlers/candidates'), { prefix });
	api.register(require('./api-handlers/dacConfig'), { prefix });
	api.register(require('./api-handlers/dacInfo'), { prefix });
	api.register(require('./api-handlers/financialReports'), { prefix });
	api.register(require('./api-handlers/getMsigProposals'), { prefix });
	api.register(require('./api-handlers/getProfile'), { prefix });
	api.register(require('./api-handlers/getProposals'), { prefix });
	api.register(require('./api-handlers/member'), { prefix });
	api.register(require('./api-handlers/memberCounts'), { prefix });
	api.register(require('./api-handlers/memberSnapshot'), { prefix });
	api.register(require('./api-handlers/myDacs'), { prefix });
	api.register(require('./api-handlers/proposalsCounts'), { prefix });
	api.register(require('./api-handlers/proposalsInbox'), { prefix });
	api.register(require('./api-handlers/referendums'), { prefix });
	api.register(require('./api-handlers/state'), { prefix });
	api.register(require('./api-handlers/tokensOwned'), { prefix });
	api.register(require('./api-handlers/transfers'), { prefix });
	api.register(require('./api-handlers/voters'), { prefix });
	api.register(require('./api-handlers/votesTimeline'), { prefix });

	api.register(fastifyOAS, openApi.options);

	const mongo_url = `${config.mongo.url}/${config.mongo.dbName}`;
	api.register(require('fastify-mongodb'), {
		url: mongo_url,
	});

	api.register(require('./fastify-eos'), config);
	api.register(require('./fastify-dac'), {});
	api.register(require('./fastify-config'), config);

	api.register(require('fastify-cors'), {
		allowedHeaders: 'Content-Type,X-DAC-Name',
		origin: '*',
	});

	api.ready().then(
		async () => {
			console.log(
				`Started API server with config ${config.environment} on ${
					config.host || '127.0.0.1'
				}:${config.port}`
			);
			await api.oas();
		},
		err => {
			console.error('Error starting API', err);
		}
	);

	return api;
};
