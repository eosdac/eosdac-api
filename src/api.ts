#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */

process.title = 'aw-api-dao';

import { Container } from '@alien-worlds/aw-core';
import fastify, { FastifyInstance } from 'fastify';
import { IncomingMessage, Server, ServerResponse } from 'http';
import fastifyCORS from 'fastify-cors';
import { fastifySwagger } from '@fastify/swagger';
import openApiOptions from './open-api';
import { ApiDependencyInjector } from '@endpoints/api.ioc.config';
import ApiConfig from './config/api-config';

export class DaoApi {
  protected api: FastifyInstance<Server, IncomingMessage, ServerResponse>;
  constructor(private config: ApiConfig) {
    this.api = fastify({
      ignoreTrailingSlash: true,
      trustProxy: true,
      logger: true,
    });

    this.api.register(fastifySwagger, openApiOptions);

    // Set IOC
    const ioc = new Container();
    const apiDependencyInjector = new ApiDependencyInjector(ioc);
    apiDependencyInjector.setup(config);

    this.api.register(fastifyCORS, {
      allowedHeaders: 'Content-Type,X-DAC-Name',
      origin: '*',
    });

    this.api.ready().then(
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
  }

  public async start() {
    const { config } = this;
    return this.api.listen(config.port, config.host);
  }

  public get framework(): FastifyInstance<
    Server,
    IncomingMessage,
    ServerResponse
  > {
    return this.api;
  }
}
