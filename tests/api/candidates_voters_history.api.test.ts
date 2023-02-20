import * as fixtures from '../fixtures/candidates_voting_history.fixture';

import { HTTP_METHOD, HTTP_STATUS } from '../common';

import { createApiTestEnvironment } from '../environments';

const environment = createApiTestEnvironment();
environment.initialize();

// meta
const Api = {
	method: HTTP_METHOD.GET,
	url: '/v1/eosdac/candidates_voters_history',
};

const Data = {
	DacId: 'nerix',
	CandidateId: 'a52qw.wam',
	Skip: '0',
	Limit: '100',
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

		expect(JSON.parse(response.body)).toEqual(
			fixtures.candidatesVotingHistorySuccessResponse
		);
	})

	it('should return empty list when provided dacId has no matching results', async () => {
		const response = await getApiResponse(
			Api.method,
			`${Api.url}?dacId=dummy&candidateId=${Data.CandidateId}&skip=${Data.Skip}&limit=${Data.Limit}`
		);

		expect(JSON.parse(response.body)).toEqual(
			fixtures.candidatesVotingHistoryEmptyResponse
		);
	});

	it('should return empty list when provided candidate has no matching results', async () => {
		const response = await getApiResponse(
			Api.method,
			`${Api.url}?dacId=${Data.DacId}&candidateId=dummy&skip=${Data.Skip}&limit=${Data.Limit}`
		);

		expect(JSON.parse(response.body)).toEqual(
			fixtures.candidatesVotingHistoryEmptyResponse
		);
	});

	it('should skip entries equal to skip parameter', async () => {
		const response = await getApiResponse(
			Api.method,
			`${Api.url}?dacId=${Data.DacId}&candidateId=${Data.CandidateId}&skip=1&limit=${Data.Limit}`
		);

		expect(JSON.parse(response.body)).toEqual(
			fixtures.candidatesVotingHistorySkipResponse
		);
	});

	it('should return entries less than or equal to limit', async () => {
		const response = await getApiResponse(
			Api.method,
			`${Api.url}?dacId=${Data.DacId}&candidateId=${Data.CandidateId}&skip=${Data.Skip}&limit=1`
		);

		expect(JSON.parse(response.body)).toEqual(
			fixtures.candidatesVotingHistoryLimitResponse
		);
	});
});

// helpers
const getApiResponse = async function (method, url) {
	return await environment.server.inject({ method, url });
};
