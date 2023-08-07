import * as fixtures from '../fixtures/profile.fixture';

import { HTTP_METHOD, HTTP_STATUS } from '../common';

import { AjvValidator } from '../../src/validator/ajv-validator';
import { config } from '@config';
import { createApiTestEnvironment } from '../environments';
import { DacIdPathParamMissingErrorResponse } from 'tests/fixtures/common.fixture';
import { GetProfileResponseSchema } from '@endpoints/profile/schemas';

const environment = createApiTestEnvironment();
environment.initialize();

const validator = AjvValidator.initialize();

const Data = {
  DACId: 'nerix',
  Account: 'suzqu.wam',
  MultipleAccounts: 'suzqu.wam,mgaqy.wam',
};

// meta
const Api = {
  method: HTTP_METHOD.GET,
  url: `/${config.urlVersion}/dao/${Data.DACId}/profile`,
};

describe('Get member profile API Test', () => {
  it('should return status 200', async () => {
    const response = await getApiResponse(
      Api.method,
      `${Api.url}?account=${Data.Account}`
    );

    expect(response.statusCode).toEqual(HTTP_STATUS.OK);
  });

  it('should return member profile', async () => {
    const response = await getApiResponse(
      Api.method,
      `${Api.url}?account=${Data.Account}`
    );

    const jsonResponse = JSON.parse(response.body);

    validator.assert(GetProfileResponseSchema, jsonResponse);
    expect(jsonResponse).toEqual(fixtures.profileResponse);
  });

  it('should accept multiple accounts and return their profiles', async () => {
    const response = await getApiResponse(
      Api.method,
      `${Api.url}?account=${Data.MultipleAccounts}`
    );

    const jsonResponse = JSON.parse(response.body);

    validator.assert(GetProfileResponseSchema, jsonResponse);
    expect(jsonResponse).toEqual(fixtures.multipleProfilesResponse);
  });

  describe('account query param', () => {
    describe('invalid account', () => {
      it('should return status 404 for invalid account', async () => {
        const response = await getApiResponse(
          Api.method,
          `${Api.url}?account=dummy`
        );

        expect(response.statusCode).toEqual(HTTP_STATUS.NOT_FOUND);
      });

      it('should return error for invalid account', async () => {
        const response = await getApiResponse(
          Api.method,
          `${Api.url}?account=dummy`
        );

        expect(JSON.parse(response.body)).toEqual(fixtures.profileNotFound);
      });
    });

    describe('account not provided', () => {
      it('should return 400 when account is not provided', async () => {
        const response = await getApiResponse(Api.method, `${Api.url}`);

        expect(response.statusCode).toEqual(HTTP_STATUS.BAD_REQUEST);
      });

      it('should return user friendly error message when account is not provided', async () => {
        const response = await getApiResponse(Api.method, `${Api.url}`);

        expect(JSON.parse(response.body)).toEqual(
          fixtures.errorQueryParamAccountMissing
        );
      });
    });
  });

  describe('dacId path param', () => {
    describe('invalid dacId', () => {
      it('should return status 500 for invalid dacId', async () => {
        const response = await getApiResponse(
          Api.method,
          `${Api.url.replace(Data.DACId, 'dummy')}?account=${Data.Account}`
        );

        expect(response.statusCode).toEqual(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      });

      it('should return response for invalid dacId', async () => {
        const response = await getApiResponse(
          Api.method,
          `${Api.url.replace(Data.DACId, 'dummy')}?account=${Data.Account}`
        );

        expect(JSON.parse(response.body)).toEqual(fixtures.badDacIdResponse);
      });
    });

    describe('dacId not provided', () => {
      it('should return 400 when account is not provided', async () => {
        const response = await getApiResponse(
          Api.method,
          `${Api.url.replace(Data.DACId, '')}?account=${Data.Account}`
        );

        expect(response.statusCode).toEqual(HTTP_STATUS.BAD_REQUEST);
      });

      it('should return user friendly error message when dacId is not provided', async () => {
        const response = await getApiResponse(
          Api.method,
          `${Api.url.replace(Data.DACId, '')}?account=${Data.Account}`
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
