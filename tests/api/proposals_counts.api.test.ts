import * as fixtures from '../fixtures/proposals_counts.fixture';

import { HTTP_METHOD, HTTP_STATUS } from '../common';

import { createApiTestEnvironment } from '../environments';

const environment = createApiTestEnvironment();
environment.initialize();

// meta
const Api = {
	method: HTTP_METHOD.GET,
	url: '/v1/eosdac/proposals_counts',
};

const Data = {
	accountWithVotes: 'token.worlds',
	anyOtherAccount: 'dao.worlds',
};

describe('Proposals counts API Test', () => {
	it('should return status 200', async () => {
		const response = await getApiResponse(
			Api.method,
			`${Api.url}?account=${Data.anyOtherAccount}`
		);

		expect(response.statusCode).toEqual(HTTP_STATUS.OK);
	});

	it('should return the count excluding votes submitted by the provided account', async () => {
		const response = await getApiResponse(
			Api.method,
			`${Api.url}?account=${Data.anyOtherAccount}`
		);

		expect(JSON.parse(response.body)).toEqual(fixtures.proposalsCountNonZero);
	});

	it('should return zero if all the countable votes are submitted by the provided account', async () => {
		const response = await getApiResponse(
			Api.method,
			`${Api.url}?account=${Data.accountWithVotes}`
		);

		expect(JSON.parse(response.body)).toEqual(fixtures.proposalsCountZero);
	});
});

// helpers
const getApiResponse = async function (method, url) {
	return await environment.server.inject({ method, url });
};
