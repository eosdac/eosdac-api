import { ApiTestEnvironment } from './api-test-environment';
import { FastifyTestEnvironment } from './fastify.environment';

export const createApiTestEnvironment = (): ApiTestEnvironment =>
  new FastifyTestEnvironment();
