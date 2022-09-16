import { createApiTestEnvironment } from '../environments';

import { HTTP_METHOD, HTTP_STATUS } from '../common';
import * as fixtures from '../fixtures/votes_timeline.fixture';

const environment = createApiTestEnvironment();
environment.initialize();

// meta
const Api = {
	method: HTTP_METHOD.GET,
	url: '/v1/eosdac/votes_timeline',
};

const Data = {
	Accounts: ['eyeke.world', 'dao.world'],
	StartBlock: '105740200',
	EndBlock: '105740215',
};

// TODO: write tests for successful response including data

describe('Votes timeline API Test', () => {
	it('should return status 200', async () => {
		const response = await getApiResponse(
			Api.method,
			`${Api.url}?account=${Data.Accounts[0]}`
		);

		expect(response.statusCode).toEqual(HTTP_STATUS.OK);
	});

	it('should return empty list when no matching results are available', async () => {
		const response = await getApiResponse(
			Api.method,
			`${Api.url}?account=${Data.Accounts[0]}`
		);

		expect(JSON.parse(response.body)).toEqual(
			fixtures.votesTimelineEmptyResponse
		);
	});

	it('should return error if account is not provided', async () => {
		const response = await getApiResponse(Api.method, Api.url);
		const jsonResp = JSON.parse(response.body);

		expect(response.statusCode).toEqual(HTTP_STATUS.BAD_REQUEST);
		expect(jsonResp.message).toEqual(
			"querystring should have required property 'account'"
		);
	});

	it('should accept multiple accounts', async () => {
		const response = await getApiResponse(
			Api.method,
			`${Api.url}?account=${Data.Accounts[0]},${Data.Accounts[1]}`
		);

		expect(response.statusCode).toEqual(HTTP_STATUS.OK);
	});
});

// helpers
const getApiResponse = async function (method, url) {
	return await environment.server.inject({ method, url });
};
