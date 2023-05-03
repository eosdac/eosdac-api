import { HTTP_METHOD, HTTP_STATUS } from '../common';

import { AjvValidator } from '../../src/validator/ajv-validator';
import { config } from '@config';
import { createApiTestEnvironment } from '../environments';
import { HealthResponseSchema } from '@endpoints/health/schemas';

const environment = createApiTestEnvironment();
environment.initialize();

const validator = AjvValidator.initialize();

// meta
const Api = {
    method: HTTP_METHOD.GET,
    url: `/${config.version}/dao/health`,
};

describe('Health API Test', () => {
    it('should return status 200', async () => {
        const response = await getApiResponse(Api.method, Api.url);

        expect(response.statusCode).toEqual(HTTP_STATUS.OK);
    });

    it('should return health status', async () => {
        const response = await getApiResponse(Api.method, Api.url);
        const jsonResponse = JSON.parse(response.body);

        validator.assert(HealthResponseSchema, jsonResponse);
    });
});

// helpers
const getApiResponse = async function (method, url) {
    return await environment.server.inject({ method, url });
};
