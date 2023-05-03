import * as fixtures from '../fixtures/candidates_voters_history.fixture';

import {
	DacIdShortLengthErrorResponse,
	InvalidLimitValueErrorResponse,
	InvalidSkipValueErrorResponse
} from 'tests/fixtures/common.fixture';
import { HTTP_METHOD, HTTP_STATUS } from '../common';

import { AjvValidator } from '@src/validator/ajv-validator';
import { CandidatesVotersHistoryResponseSchema } from '@endpoints/candidates-voters-history/schemas';
import { config } from '@config';
import { createApiTestEnvironment } from '../environments';

const environment = createApiTestEnvironment();
environment.initialize();

const validator = AjvValidator.initialize();

// meta
const Api = {
	method: HTTP_METHOD.GET,
	url: `/${config.version}/dao/candidates_voters_history`,
};

const Data = {
	DacId: 'nerix',
	CandidateId: 'a52qw.wam',
	Skip: 0,
	Limit: 100,
};

describe('Candidate Voting history API Test', () => {
	it('should return status 200', async () => {
		const response = await getApiResponse(
			Api.method,
			`${Api.url}?dacId=${Data.DacId}&candidateId=${Data.CandidateId}&skip=${Data.Skip}&limit=${Data.Limit}`
		);

		expect(response.statusCode).toEqual(HTTP_STATUS.OK);
	});

	it('should return candidate voting history', async () => {
		const response = await getApiResponse(
			Api.method,
			`${Api.url}?dacId=${Data.DacId}&candidateId=${Data.CandidateId}&skip=${Data.Skip}&limit=${Data.Limit}`
		);
		const jsonResponse = JSON.parse(response.body);

		validator.assert(CandidatesVotersHistoryResponseSchema, jsonResponse);

		expect(jsonResponse.results.length).toBeGreaterThanOrEqual(1);
	})


	describe('dacId query param', () => {
		it('should return empty list when provided dacId has no matching results', async () => {
			const response = await getApiResponse(
				Api.method,
				`${Api.url}?dacId=dummy&candidateId=${Data.CandidateId}&skip=${Data.Skip}&limit=${Data.Limit}`
			);
			const jsonResponse = JSON.parse(response.body);

			validator.assert(CandidatesVotersHistoryResponseSchema, jsonResponse);

			expect(jsonResponse).toEqual(
				fixtures.candidatesVotingHistoryEmptyResponse
			);
		});

		it('should return 400 when dacId is missing', async () => {
			const response = await getApiResponse(
				Api.method,
				`${Api.url}?candidateId=${Data.CandidateId}&skip=${Data.Skip}&limit=${Data.Limit}`
			);

			expect(response.statusCode).toEqual(HTTP_STATUS.BAD_REQUEST);
		});

		it('should return error message when dacId is missing', async () => {
			const response = await getApiResponse(
				Api.method,
				`${Api.url}?candidateId=${Data.CandidateId}&skip=${Data.Skip}&limit=${Data.Limit}`
			);
			const jsonResponse = JSON.parse(response.body);

			expect(jsonResponse).toEqual(fixtures.missingDacIdErrorResponse);
		});

		it('should return error message when dacId value is less than minimum length', async () => {
			const response = await getApiResponse(
				Api.method,
				`${Api.url}?dacId=abcd&candidateId=${Data.CandidateId}&skip=${Data.Skip}&limit=${Data.Limit}`
			);
			const jsonResponse = JSON.parse(response.body);

			expect(jsonResponse).toEqual(DacIdShortLengthErrorResponse);
		});
	});


	describe('candidateId query param', () => {
		it('should return empty list when provided candidate has no matching results', async () => {
			const response = await getApiResponse(
				Api.method,
				`${Api.url}?dacId=${Data.DacId}&candidateId=dummy&skip=${Data.Skip}&limit=${Data.Limit}`
			);
			const jsonResponse = JSON.parse(response.body);

			validator.assert(CandidatesVotersHistoryResponseSchema, jsonResponse);

			expect(jsonResponse).toEqual(
				fixtures.candidatesVotingHistoryEmptyResponse
			);
		});

		it('should return error when candidateId is missing', async () => {
			const response = await getApiResponse(
				Api.method,
				`${Api.url}?dacId=${Data.DacId}&skip=${Data.Skip}&limit=${Data.Limit}`
			);
			const jsonResponse = JSON.parse(response.body);

			expect(jsonResponse).toEqual(fixtures.missingCandidateIdErrorResponse);
		});
	})


	describe('skip query param', () => {
		it('should skip entries equal to skip parameter', async () => {
			const noSkipResponse = await getApiResponse(
				Api.method,
				`${Api.url}?dacId=${Data.DacId}&candidateId=${Data.CandidateId}&skip=0&limit=2`
			);
			const jsonNoSkip = JSON.parse(noSkipResponse.body);
			validator.assert(CandidatesVotersHistoryResponseSchema, jsonNoSkip);

			const skipResponse = await getApiResponse(
				Api.method,
				`${Api.url}?dacId=${Data.DacId}&candidateId=${Data.CandidateId}&skip=1&limit=2`
			);
			const jsonSkip = JSON.parse(skipResponse.body);
			validator.assert(CandidatesVotersHistoryResponseSchema, jsonSkip);

			expect(jsonNoSkip.results[0].transactionId).not.toEqual(jsonSkip.results[0].transactionId);
			expect(jsonNoSkip.results[1].transactionId).toEqual(jsonSkip.results[0].transactionId);
		});

		it('should return error if skip is negative', async () => {
			const skip = -1;
			const response = await getApiResponse(
				Api.method,
				`${Api.url}?dacId=${Data.DacId}&candidateId=${Data.CandidateId}&skip=${skip}&limit=${Data.Limit}`
			);
			const jsonResponse = JSON.parse(response.body);

			expect(jsonResponse).toEqual(InvalidSkipValueErrorResponse)
		});
	})


	describe('limit query param', () => {
		it('should return entries less than or equal to limit', async () => {
			const response = await getApiResponse(
				Api.method,
				`${Api.url}?dacId=${Data.DacId}&candidateId=${Data.CandidateId}&skip=${Data.Skip}&limit=${Data.Limit}`
			);
			const jsonResponse = JSON.parse(response.body);

			validator.assert(CandidatesVotersHistoryResponseSchema, jsonResponse);

			expect(jsonResponse.results.length).toBeLessThanOrEqual(Data.Limit);
		});

		it('should return error if limit is zero', async () => {
			const limit = 0;
			const response = await getApiResponse(
				Api.method,
				`${Api.url}?dacId=${Data.DacId}&candidateId=${Data.CandidateId}&skip=${Data.Skip}&limit=${limit}`
			);
			const jsonResponse = JSON.parse(response.body);

			expect(jsonResponse).toEqual(InvalidLimitValueErrorResponse)
		});

		it('should return error if limit is negative', async () => {
			const limit = -1;
			const response = await getApiResponse(
				Api.method,
				`${Api.url}?dacId=${Data.DacId}&candidateId=${Data.CandidateId}&skip=${Data.Skip}&limit=${limit}`
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
