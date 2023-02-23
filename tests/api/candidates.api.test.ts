import { HTTP_METHOD, HTTP_STATUS } from '../common';

import { AjvValidator } from '@src/validator/ajv-validator';
import { CandidatesResponseSchema } from '@endpoints/candidates/schemas';
import { createApiTestEnvironment } from '../environments';
import { DacIdPathParamMissingErrorResponse } from 'tests/fixtures/common.fixture';
import { errorQueryParamWalletIdMissing } from '../fixtures/candidates.fixture';

const environment = createApiTestEnvironment();
environment.initialize();

const validator = AjvValidator.initialize();

const Data = {
	DacId: 'nerix',
	WalletId: '.1uqy.wam',
};

// meta
const Api = {
	method: HTTP_METHOD.GET,
	url: `/v1/eosdac/${Data.DacId}/candidates`,
};

describe('Candidates API Test', () => {
	it('should return status 200', async () => {
		const response = await getApiResponse(
			Api.method,
			`${Api.url}?walletId=${Data.WalletId}`
		);

		expect(response.statusCode).toEqual(HTTP_STATUS.OK);
	});

	it('should return list of candidates', async () => {
		const response = await getApiResponse(
			Api.method,
			`${Api.url}?walletId=${Data.WalletId}`
		);
		const jsonResponse = JSON.parse(response.body);

		validator.assert(CandidatesResponseSchema, jsonResponse);
	});

	describe('dacId path param', () => {
		it('should return candidates with planetName equal to provided dacId', async () => {
			const response = await getApiResponse(Api.method, `${Api.url}?walletId=${Data.WalletId}`);
			const jsonResponse = JSON.parse(response.body);

			validator.assert(CandidatesResponseSchema, jsonResponse);

			jsonResponse.forEach(candidate => {
				expect(candidate).toMatchObject({
					planetName: Data.DacId,
				})
			});
		});

		describe('invalid dacId', () => {
			it('should return status code 500 for invalid dacId', async () => {
				const response = await getApiResponse(
					Api.method,
					`${Api.url.replace(Data.DacId, 'dummy')}?walletId=${Data.WalletId}`
				);

				expect(response.statusCode).toEqual(HTTP_STATUS.INTERNAL_SERVER_ERROR);
			});

			it('should return empty array for invalid dacId', async () => {
				const response = await getApiResponse(
					Api.method,
					`${Api.url.replace(Data.DacId, 'dummy')}?walletId=${Data.WalletId}`
				);
				const jsonResponse = JSON.parse(response.body);

				expect(jsonResponse).toEqual([]);
			});
		})

		describe('dacId not provided', () => {
			it('should return 400 when account is not provided', async () => {
				const response = await getApiResponse(
					Api.method,
					`${Api.url.replace(Data.DacId, '')}?walletId=${Data.WalletId}`
				);

				expect(response.statusCode).toEqual(HTTP_STATUS.BAD_REQUEST);
			});

			it('should return user friendly error message when dacId is not provided', async () => {
				const response = await getApiResponse(
					Api.method,
					`${Api.url.replace(Data.DacId, '')}?walletId=${Data.WalletId}`
				);

				expect(JSON.parse(response.body)).toEqual(DacIdPathParamMissingErrorResponse);
			});
		})
	});

	describe('walletId query param', () => {
		describe('invalid walletId', () => {
			it('should return status 200 for invalid walletId', async () => {
				const response = await getApiResponse(Api.method, `${Api.url}?walletId=dummy`);

				expect(response.statusCode).toEqual(HTTP_STATUS.OK);
			});

			it('should return success response for invalid walletId', async () => {
				const response = await getApiResponse(Api.method, `${Api.url}?walletId=dummy`);
				const jsonResponse = JSON.parse(response.body);

				expect(jsonResponse.length).toBeGreaterThanOrEqual(1);
				validator.assert(CandidatesResponseSchema, jsonResponse);
			});
		})

		describe('walletId not provided', () => {
			it('should return 400 when walletId is not provided', async () => {
				const response = await getApiResponse(Api.method, Api.url);

				expect(response.statusCode).toEqual(HTTP_STATUS.BAD_REQUEST);
			});

			it('should return user friendly error message when walletId is not provided', async () => {
				const response = await getApiResponse(Api.method, Api.url);

				expect(JSON.parse(response.body)).toEqual(errorQueryParamWalletIdMissing);
			});
		})
	});
});

// helpers
const getApiResponse = async function (method, url) {
	return await environment.server.inject({ method, url });
};
