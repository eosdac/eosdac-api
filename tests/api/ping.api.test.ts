import { HTTP_METHOD, HTTP_STATUS } from '../common';

import { AjvValidator } from '../../src/validator/ajv-validator';
import { PingResponseSchema } from '@endpoints/ping/schemas';
import { config } from '@config';
import { createApiTestEnvironment } from '../environments';

const environment = createApiTestEnvironment();
environment.initialize();

const validator = AjvValidator.initialize();

// meta
const Api = {
  method: HTTP_METHOD.GET,
  url: `/${config.urlVersion}/dao/ping`,
};

describe('Ping API Test', () => {
  it('should return status 200', async () => {
    const response = await getApiResponse(Api.method, Api.url);

    expect(response.statusCode).toEqual(HTTP_STATUS.OK);
  });

  it('should return pong', async () => {
    const response = await getApiResponse(Api.method, Api.url);
    const jsonResponse = JSON.parse(response.body);

    validator.assert(PingResponseSchema, jsonResponse);
  });
});

// helpers
const getApiResponse = async function (method, url) {
  return await environment.server.inject({ method, url });
};
