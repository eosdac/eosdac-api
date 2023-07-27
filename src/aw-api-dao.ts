#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */

process.title = 'aw-api-dao';

import { Container, Route } from '@alien-worlds/aw-core';
import fastify, { FastifyInstance } from 'fastify';
import { IncomingMessage, Server, ServerResponse } from 'http';

import { CandidatesController } from './endpoints/candidates/domain/candidates.controller';
import { CandidatesVotersHistoryController } from './endpoints/candidates-voters-history/domain/candidates-voters-history.controller';
import { config } from './config';
import { CustodiansController } from './endpoints/custodians/domain/custodians.controller';
import fastifyCORS from 'fastify-cors';
import { fastifySwagger } from '@fastify/swagger';
import { GetCandidatesRoute } from './endpoints/candidates/routes/get-candidates.route';
import { GetCandidatesVotersHistoryRoute } from './endpoints/candidates-voters-history/routes/candidates-voters-history.route';
import { GetCustodiansRoute } from './endpoints/custodians/routes/get-custodians.route';
import { GetDacsController } from './endpoints/get-dacs/domain/get-dacs.controller';
import { GetDacsRoute } from './endpoints/get-dacs/routes/dacs.route';
import { GetHealthRoute } from './endpoints/health/routes/health.route';
import { GetProfileRoute } from './endpoints/profile/routes/get-profile.route';
import { GetVotingHistoryRoute } from './endpoints/voting-history/routes/voting-history.route';
import { HealthController } from './endpoints/health/domain/health.controller';
import { initLogger } from './connections/logger';
import openApiOptions from './open-api';
import { ProfileController } from './endpoints/profile/domain/profile.controller';
import { setupEndpointDependencies } from './endpoints/api.ioc.config';
import { VotingHistoryController } from './endpoints/voting-history/domain/voting-history.controller';

initLogger('aw-api-dao', config.logger);

export const buildAPIServer = async () => {
  const api: FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify(
    {
      ignoreTrailingSlash: true,
      trustProxy: true,
      logger: true,
    }
  );

  api.register(fastifySwagger, openApiOptions);

  // Set IOC
  const apiIoc = await setupEndpointDependencies(new Container(), config);

  // controllers
  const healthController: HealthController = apiIoc.get<HealthController>(
    HealthController.Token
  );

  const profileController: ProfileController = apiIoc.get<ProfileController>(
    ProfileController.Token
  );

  const getDacsController: GetDacsController = apiIoc.get<GetDacsController>(
    GetDacsController.Token
  );

  const votingHistoryController: VotingHistoryController =
    apiIoc.get<VotingHistoryController>(VotingHistoryController.Token);

  const candidatesVotersHistoryController: CandidatesVotersHistoryController =
    apiIoc.get<CandidatesVotersHistoryController>(
      CandidatesVotersHistoryController.Token
    );

  const candidatesController: CandidatesController =
    apiIoc.get<CandidatesController>(CandidatesController.Token);

  const custodiansController: CustodiansController =
    apiIoc.get<CustodiansController>(CustodiansController.Token);

  // Mount routes

  Route.mount(
    api,
    GetHealthRoute.create(healthController.health.bind(healthController))
  );

  Route.mount(
    api,
    GetProfileRoute.create(profileController.profile.bind(profileController))
  );

  Route.mount(
    api,
    GetDacsRoute.create(getDacsController.dacs.bind(getDacsController))
  );

  Route.mount(
    api,
    GetVotingHistoryRoute.create(
      votingHistoryController.votingHistory.bind(votingHistoryController)
    )
  );

  Route.mount(
    api,
    GetCandidatesVotersHistoryRoute.create(
      candidatesVotersHistoryController.candidatesVotersHistory.bind(
        candidatesVotersHistoryController
      )
    )
  );

  Route.mount(
    api,
    GetCandidatesRoute.create(
      candidatesController.list.bind(candidatesController)
    )
  );

  Route.mount(
    api,
    GetCustodiansRoute.create(
      custodiansController.list.bind(custodiansController)
    )
  );

  api.register(fastifyCORS, {
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
    },
    err => {
      console.error('Error starting API', err);
    }
  );

  return api;
};
