import { createApiTestEnvironment } from '../environments';

import { HTTP_METHOD, HTTP_STATUS } from '../common';
import * as fixtures from '../fixtures/member_counts.fixture';

const environment = createApiTestEnvironment();
environment.initialize();

// meta
const Api = {
	method: HTTP_METHOD.GET,
	url: '/v1/eosdac/member_counts',
};

describe('Member counts API Test', () => {
	it('should return status 200', async () => {
		const response = await getApiResponse(Api.method, Api.url);

		expect(response.statusCode).toEqual(HTTP_STATUS.OK);
	});

	it('should return the count', async () => {
		const response = await getApiResponse(Api.method, Api.url);

		expect(JSON.parse(response.body)).toEqual(fixtures.memberCountsResponse);
	});
});

// helpers
const getApiResponse = async function (method, url) {
	return await environment.server.inject({ method, url });
};
