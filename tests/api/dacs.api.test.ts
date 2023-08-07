import { HTTP_METHOD, HTTP_STATUS } from '../common';

import { AjvValidator } from '../../src/validator/ajv-validator';
import { config } from '@config';
import { createApiTestEnvironment } from '../environments';
import { DacsResponseSchema } from '@endpoints/dacs/schemas';
import { InvalidLimitValueErrorResponse } from 'tests/fixtures/common.fixture';

const environment = createApiTestEnvironment();
environment.initialize();

const validator = AjvValidator.initialize();

// meta
const Api = {
  method: HTTP_METHOD.GET,
  url: `/${config.urlVersion}/dao/dacs`,
};

const Data = {
  DacId: 'eyeke',
  Limit: 5,
  AllDacs: ['eyeke', 'kavian', 'magor', 'naron', 'nerix'],
};

describe('Dacs API Test', () => {
  it('should return status 200', async () => {
    const response = await getApiResponse(Api.method, `${Api.url}`);

    expect(response.statusCode).toEqual(HTTP_STATUS.OK);
  });

  it('should return list of dacs', async () => {
    const response = await getApiResponse(
      Api.method,
      `${Api.url}?limit=${Data.Limit}`
    );
    const jsonResponse = JSON.parse(response.body);

    validator.assert(DacsResponseSchema, jsonResponse);

    expect(jsonResponse.count).toBeGreaterThan(1);
  });

  it('returns count equal to number of results', async () => {
    const response = await getApiResponse(
      Api.method,
      `${Api.url}?limit=${Data.Limit}`
    );
    const jsonResponse = JSON.parse(response.body);

    validator.assert(DacsResponseSchema, jsonResponse);

    expect(jsonResponse.count).toBe(jsonResponse.results.length);
  });

  describe('dacId param', () => {
    it('should return only specified dac', async () => {
      const response = await getApiResponse(
        Api.method,
        `${Api.url}?dacId=${Data.DacId}`
      );
      const jsonResponse = JSON.parse(response.body);

      validator.assert(DacsResponseSchema, jsonResponse);

      expect(jsonResponse.results.length).toBe(1);
      expect(jsonResponse.results[0].dacId).toBe(Data.DacId);
    });

    it('should return status code 404 for invalid dacId', async () => {
      const response = await getApiResponse(
        Api.method,
        `${Api.url}?dacId=dummy`
      );

      expect(response.statusCode).toEqual(HTTP_STATUS.NOT_FOUND);
    });

    it('should return error for invalid dacId', async () => {
      const response = await getApiResponse(
        Api.method,
        `${Api.url}?dacId=dummy`
      );
      const jsonResponse = JSON.parse(response.body);

      expect(jsonResponse.error).toBe(
        "Data with dummy in scope: 'index.worlds' table: 'dacs' scope not found"
      );
    });
  });

  describe('limit query param', () => {
    it('should return results less than or equal to limit', async () => {
      const response = await getApiResponse(Api.method, `${Api.url}?limit=2`);
      const jsonResponse = JSON.parse(response.body);

      validator.assert(DacsResponseSchema, jsonResponse);

      expect(jsonResponse.results.length).toBeLessThanOrEqual(2);
    });

    it('should return error if limit is zero', async () => {
      const response = await getApiResponse(Api.method, `${Api.url}?limit=0`);
      const jsonResponse = JSON.parse(response.body);

      expect(jsonResponse).toEqual(InvalidLimitValueErrorResponse);
    });

    it('should return error if limit is negative', async () => {
      const response = await getApiResponse(Api.method, `${Api.url}?limit=-1`);
      const jsonResponse = JSON.parse(response.body);

      expect(jsonResponse).toEqual(InvalidLimitValueErrorResponse);
    });
  });

  describe('should return each individual dac', () => {
    test.each(Data.AllDacs)("should return dac '%s'", async dacId => {
      const response = await getApiResponse(
        Api.method,
        `${Api.url}?dacId=${dacId}`
      );
      const jsonResponse = JSON.parse(response.body);

      validator.assert(DacsResponseSchema, jsonResponse);

      expect(jsonResponse.results.length).toBe(1);
      expect(jsonResponse.results[0].dacId).toBe(dacId);
    });
  });
});

// helpers
const getApiResponse = async function (method, url) {
  return await environment.server.inject({ method, url });
};
