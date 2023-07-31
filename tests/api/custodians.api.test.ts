import { HTTP_METHOD, HTTP_STATUS } from '../common';

import { AjvValidator } from '@src/validator/ajv-validator';
import { config } from '@config';
import { createApiTestEnvironment } from '../environments';
import { CustodiansResponseSchema } from '@endpoints/custodians/schemas';
import { DacIdPathParamMissingErrorResponse } from 'tests/fixtures/common.fixture';

const environment = createApiTestEnvironment();
environment.initialize();

const validator = AjvValidator.initialize();

const Data = {
  DacId: 'nerix',
};

// meta
const Api = {
  method: HTTP_METHOD.GET,
  url: `/${config.urlVersion}/dao/${Data.DacId}/custodians`,
};

describe('Custodians API Test', () => {
  it('should return status 200', async () => {
    const response = await getApiResponse(Api.method, `${Api.url}`);

    expect(response.statusCode).toEqual(HTTP_STATUS.OK);
  });

  it('should return list of custodians', async () => {
    const response = await getApiResponse(Api.method, `${Api.url}`);
    const jsonResponse = JSON.parse(response.body);

    expect(jsonResponse.length).toBeGreaterThanOrEqual(1);
    validator.assert(CustodiansResponseSchema, jsonResponse);
  });

  describe('dacId path param', () => {
    it('should return custodians with planetName equal to provided dacId', async () => {
      const response = await getApiResponse(Api.method, `${Api.url}`);
      const jsonResponse = JSON.parse(response.body);

      validator.assert(CustodiansResponseSchema, jsonResponse);

      jsonResponse.forEach(custodian => {
        expect(custodian).toMatchObject({
          planetName: Data.DacId,
        });
      });
    });

    describe('invalid dacId', () => {
      it('should return status code 500 for invalid dacId', async () => {
        const response = await getApiResponse(
          Api.method,
          `${Api.url.replace(Data.DacId, 'dummy')}`
        );

        expect(response.statusCode).toEqual(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      });

      it('should return empty array for invalid dacId', async () => {
        const response = await getApiResponse(
          Api.method,
          `${Api.url.replace(Data.DacId, 'dummy')}`
        );
        const jsonResponse = JSON.parse(response.body);

        expect(jsonResponse).toEqual([]);
      });
    });

    describe('dacId not provided', () => {
      it('should return 400 when account is not provided', async () => {
        const response = await getApiResponse(
          Api.method,
          `${Api.url.replace(Data.DacId, '')}`
        );

        expect(response.statusCode).toEqual(HTTP_STATUS.BAD_REQUEST);
      });

      it('should return user friendly error message when dacId is not provided', async () => {
        const response = await getApiResponse(
          Api.method,
          `${Api.url.replace(Data.DacId, '')}`
        );

        expect(JSON.parse(response.body)).toEqual(
          DacIdPathParamMissingErrorResponse
        );
      });
    });
  });
});

// helpers
const getApiResponse = async function (method, url) {
  return await environment.server.inject({ method, url });
};
