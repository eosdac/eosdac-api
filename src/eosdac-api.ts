#!/usr/bin/env node

process.title = 'eosdac-api';

import fastify, { FastifyInstance } from 'fastify';
import { IncomingMessage, Server, ServerResponse } from 'http';

import { config } from './config';
import { Container } from 'inversify';
import { FastifyRoute } from './fastify.route';
import { GetDacsController } from './endpoints/get-dacs/domain/get-dacs.controller';
import { GetDacsRoute } from './endpoints/get-dacs/routes/dacs.route';
import { GetProfileRoute } from './endpoints/profile/routes/get-profile.route';
import { GetProposalsCountsRoute } from './endpoints/proposals-counts/routes/proposals-counts.route';
import { GetStateRoute } from './endpoints/state/routes/state.route';
import { GetVotingHistoryRoute } from './endpoints/voting-history/routes/voting-history.route';
import { logger } from './connections/logger';
import { ProfileController } from './endpoints/profile/domain/profile.controller';
import { ProposalsCountsController } from './endpoints/proposals-counts/domain/proposals-counts.controller';
import { ProposalsInboxController } from './endpoints/proposals-inbox/domain/proposals-inbox.controller';
import { ProposalsInboxRoute } from './endpoints/proposals-inbox/routes/proposals-inbox.route';
import { setupEndpointDependencies } from './endpoints/api.ioc.config';
import { StateController } from './endpoints/state/domain/state.controller';
import { VotingHistoryController } from './endpoints/voting-history/domain/voting-history.controller';

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
	api.register(require('./api-handlers/getProposals'), { prefix });
	api.register(require('./api-handlers/member'), { prefix });
	api.register(require('./api-handlers/memberCounts'), { prefix });
	api.register(require('./api-handlers/memberSnapshot'), { prefix });
	api.register(require('./api-handlers/myDacs'), { prefix });
	api.register(require('./api-handlers/referendums'), { prefix });
	api.register(require('./api-handlers/tokensOwned'), { prefix });
	api.register(require('./api-handlers/transfers'), { prefix });
	api.register(require('./api-handlers/voters'), { prefix });
	api.register(require('./api-handlers/votesTimeline'), { prefix });

	api.register(fastifyOAS, openApi.options);

	// Set IOC
	const apiIoc = await setupEndpointDependencies(new Container(), config);

	// controllers
	const stateController: StateController = apiIoc.get<StateController>(
		StateController.Token
	);

	const proposalsCountsController: ProposalsCountsController =
		apiIoc.get<ProposalsCountsController>(ProposalsCountsController.Token);

	const proposalsInboxController: ProposalsInboxController =
		apiIoc.get<ProposalsInboxController>(ProposalsInboxController.Token);

	const profileController: ProfileController =
		apiIoc.get<ProfileController>(ProfileController.Token);

	const getDacsController: GetDacsController =
		apiIoc.get<GetDacsController>(GetDacsController.Token);

	const votingHistoryController: VotingHistoryController =
		apiIoc.get<VotingHistoryController>(VotingHistoryController.Token);

	// Mount routes
	FastifyRoute.mount(
		api,
		GetStateRoute.create(stateController.getState.bind(stateController))
	);

	FastifyRoute.mount(
		api,
		GetProposalsCountsRoute.create(
			proposalsCountsController.proposalsCounts.bind(proposalsCountsController)
		)
	);

	FastifyRoute.mount(
		api,
		GetProfileRoute.create(
			profileController.profile.bind(profileController)
		)
	);

	FastifyRoute.mount(
		api,
		ProposalsInboxRoute.create(
			proposalsInboxController.proposalsInbox.bind(proposalsInboxController)
		)
	);

	FastifyRoute.mount(
		api,
		GetDacsRoute.create(
			getDacsController.dacs.bind(getDacsController)
		)
	);

	FastifyRoute.mount(
		api,
		GetVotingHistoryRoute.create(
			votingHistoryController.votingHistory.bind(votingHistoryController)
		)
	);

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
				`Started API server with config ${config.environment} on ${config.host || '127.0.0.1'
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
