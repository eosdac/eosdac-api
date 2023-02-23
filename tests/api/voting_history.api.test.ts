import * as fixtures from '../fixtures/voting_history.fixture';

import {
	DacIdShortLengthErrorResponse,
	InvalidLimitValueErrorResponse,
	InvalidSkipValueErrorResponse
} from 'tests/fixtures/common.fixture';
import { HTTP_METHOD, HTTP_STATUS } from '../common';

import { AjvValidator } from '@src/validator/ajv-validator';
import { createApiTestEnvironment } from '../environments';
import { VotingHistoryResponseSchema } from '@endpoints/voting-history/schemas';

const environment = createApiTestEnvironment();
environment.initialize();

const validator = AjvValidator.initialize();

// meta
const Api = {
	method: HTTP_METHOD.GET,
	url: '/v1/eosdac/voting_history',
};

const Data = {
	DacId: 'nerix',
	Voter: '.w2fo.wam',
	Skip: 0,
	Limit: 100,
};

describe('Voting history API Test', () => {
	it('should return status 200', async () => {
		const response = await getApiResponse(
			Api.method,
			`${Api.url}?dacId=${Data.DacId}&voter=${Data.Voter}&skip=${Data.Skip}&limit=${Data.Limit}`
		);

		expect(response.statusCode).toEqual(HTTP_STATUS.OK);
	});

	it('should return voting history', async () => {
		const response = await getApiResponse(
			Api.method,
			`${Api.url}?dacId=${Data.DacId}&voter=${Data.Voter}&skip=${Data.Skip}&limit=${Data.Limit}`
		);
		const jsonResponse = JSON.parse(response.body);

		validator.assert(VotingHistoryResponseSchema, jsonResponse);
	});


	describe('dacId query param', () => {
		it('should return empty list when provided dacId has no matching results', async () => {
			const response = await getApiResponse(
				Api.method,
				`${Api.url}?dacId=dummy&voter=${Data.Voter}&skip=${Data.Skip}&limit=${Data.Limit}`
			);

			expect(JSON.parse(response.body)).toEqual(
				fixtures.votingHistoryEmptyResponse
			);
		});

		it('should return 400 when dacId is missing', async () => {
			const response = await getApiResponse(
				Api.method,
				`${Api.url}?voter=${Data.Voter}&skip=${Data.Skip}&limit=${Data.Limit}`
			);

			expect(response.statusCode).toEqual(HTTP_STATUS.BAD_REQUEST);
		});

		it('should return error message when dacId is missing', async () => {
			const response = await getApiResponse(
				Api.method,
				`${Api.url}?voter=${Data.Voter}&skip=${Data.Skip}&limit=${Data.Limit}`
			);
			const jsonResponse = JSON.parse(response.body);

			expect(jsonResponse).toEqual(fixtures.missingDacIdErrorResponse);
		});

		it('should return error message when dacId value is less than minimum length', async () => {
			const response = await getApiResponse(
				Api.method,
				`${Api.url}?dacId=abcd&voter=${Data.Voter}&skip=${Data.Skip}&limit=${Data.Limit}`
			);
			const jsonResponse = JSON.parse(response.body);

			expect(jsonResponse).toEqual(DacIdShortLengthErrorResponse);
		});
	})


	describe('voter query param', () => {
		it('should return empty list when provided voter has no matching results', async () => {
			const response = await getApiResponse(
				Api.method,
				`${Api.url}?dacId=${Data.DacId}&voter=dummy&skip=${Data.Skip}&limit=${Data.Limit}`
			);

			expect(JSON.parse(response.body)).toEqual(
				fixtures.votingHistoryEmptyResponse
			);
		});

		it('should return error when voter is missing', async () => {
			const response = await getApiResponse(
				Api.method,
				`${Api.url}?dacId=${Data.DacId}&skip=${Data.Skip}&limit=${Data.Limit}`
			);
			const jsonResponse = JSON.parse(response.body);

			expect(jsonResponse).toEqual(fixtures.missingVoterErrorResponse);
		});
	})


	describe('skip query param', () => {
		it('should skip entries equal to skip parameter', async () => {
			const noSkipResponse = await getApiResponse(
				Api.method,
				`${Api.url}?dacId=${Data.DacId}&voter=${Data.Voter}&skip=0&limit=${Data.Limit}`
			);
			const jsonNoSkip = JSON.parse(noSkipResponse.body);
			validator.assert(VotingHistoryResponseSchema, jsonNoSkip);

			const skipResponse = await getApiResponse(
				Api.method,
				`${Api.url}?dacId=${Data.DacId}&voter=${Data.Voter}&skip=1&limit=2`
			);
			const jsonSkip = JSON.parse(skipResponse.body);
			validator.assert(VotingHistoryResponseSchema, jsonSkip);

			expect(jsonNoSkip.results[0]).not.toEqual(jsonSkip.results[0]);
			expect(jsonNoSkip.results[1]).toEqual(jsonSkip.results[0]);
		});

		it('should return error if skip is negative', async () => {
			const skip = -1;
			const response = await getApiResponse(
				Api.method,
				`${Api.url}?dacId=${Data.DacId}&voter=${Data.Voter}&skip=${skip}&limit=${Data.Limit}`
			);
			const jsonResponse = JSON.parse(response.body);

			expect(jsonResponse).toEqual(InvalidSkipValueErrorResponse)
		});
	})

	describe('limit query param', () => {
		it('should return entries less than or equal to limit', async () => {
			const response = await getApiResponse(
				Api.method,
				`${Api.url}?dacId=${Data.DacId}&voter=${Data.Voter}&skip=${Data.Skip}&limit=${Data.Limit}`
			);

			expect(JSON.parse(response.body).count).toBeLessThanOrEqual(Data.Limit);
		});

		it('should return error if limit is zero', async () => {
			const limit = 0;
			const response = await getApiResponse(
				Api.method,
				`${Api.url}?dacId=${Data.DacId}&voter=${Data.Voter}&skip=${Data.Skip}&limit=${limit}`
			);
			const jsonResponse = JSON.parse(response.body);

			expect(jsonResponse).toEqual(InvalidLimitValueErrorResponse)
		});

		it('should return error if limit is negative', async () => {
			const limit = -1;
			const response = await getApiResponse(
				Api.method,
				`${Api.url}?dacId=${Data.DacId}&voter=${Data.Voter}&skip=${Data.Skip}&limit=${limit}`
			);
			const jsonResponse = JSON.parse(response.body);

			expect(jsonResponse).toEqual(InvalidLimitValueErrorResponse)
		});
	})
});

// helpers
const getApiResponse = async function (method, url) {
	return await environment.server.inject({ method, url });
};
