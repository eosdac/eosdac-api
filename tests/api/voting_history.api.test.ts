import * as fixtures from '../fixtures/voting_history.fixture';

import { HTTP_METHOD, HTTP_STATUS } from '../common';

import { createApiTestEnvironment } from '../environments';

const environment = createApiTestEnvironment();
environment.initialize();

// meta
const Api = {
	method: HTTP_METHOD.GET,
	url: '/v1/dao/voting_history',
};

const Data = {
	DacId: 'nerix',
	Voter: '.w2fo.wam',
	Skip: '0',
	Limit: '100',
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

		expect(JSON.parse(response.body)).toEqual(
			fixtures.votingHistorySuccessResponse
		);
	});

	it('should return empty list when provided dacId has no matching results', async () => {
		const response = await getApiResponse(
			Api.method,
			`${Api.url}?dacId=dummy&voter=${Data.Voter}&skip=${Data.Skip}&limit=${Data.Limit}`
		);

		expect(JSON.parse(response.body)).toEqual(
			fixtures.votingHistoryEmptyResponse
		);
	});

	it('should return empty list when provided voter has no matching results', async () => {
		const response = await getApiResponse(
			Api.method,
			`${Api.url}?dacId=${Data.DacId}&voter=dummy&skip=${Data.Skip}&limit=${Data.Limit}`
		);

		expect(JSON.parse(response.body)).toEqual(
			fixtures.votingHistoryEmptyResponse
		);
	});

	it('should skip entries equal to skip parameter', async () => {
		const response = await getApiResponse(
			Api.method,
			`${Api.url}?dacId=${Data.DacId}&voter=${Data.Voter}&skip=1&limit=${Data.Limit}`
		);

		expect(JSON.parse(response.body)).toEqual(
			fixtures.votingHistorySkipResponse
		);
	});

	it('should return entries less than or equal to limit', async () => {
		const response = await getApiResponse(
			Api.method,
			`${Api.url}?dacId=${Data.DacId}&voter=${Data.Voter}&skip=${Data.Skip}&limit=1`
		);

		expect(JSON.parse(response.body)).toEqual(
			fixtures.votingHistoryLimitResponse
		);
	});
});

// helpers
const getApiResponse = async function (method, url) {
	return await environment.server.inject({ method, url });
};
