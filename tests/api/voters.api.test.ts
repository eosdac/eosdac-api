import { createApiTestEnvironment } from '../environments';

import { HTTP_METHOD, HTTP_STATUS } from '../common';
import * as fixtures from '../fixtures/voters.fixture';

const environment = createApiTestEnvironment();
environment.initialize();

// meta
const Api = {
	method: HTTP_METHOD.GET,
	url: '/v1/eosdac/voters',
};

const Data = {
	Candidate: 'awtesterooo1',
};

// TODO: write tests for successful response including data

describe('Voters API Test', () => {
	it('should return status 200', async () => {
		const response = await getApiResponse(
			Api.method,
			`${Api.url}?candidate=${Data.Candidate}`
		);

		expect(response.statusCode).toEqual(HTTP_STATUS.OK);
	});

	it('should return empty list when no matching results are available', async () => {
		const response = await getApiResponse(
			Api.method,
			`${Api.url}?candidate=${Data.Candidate}`
		);

		expect(JSON.parse(response.body)).toEqual(fixtures.emptyResponse);
	});

	it('should return error if candidate is not provided', async () => {
		const response = await getApiResponse(Api.method, Api.url);
		const jsonResp = JSON.parse(response.body);

		expect(response.statusCode).toEqual(HTTP_STATUS.BAD_REQUEST);
		expect(jsonResp.message).toEqual(
			"querystring should have required property 'candidate'"
		);
	});
});

// helpers
const getApiResponse = async function (method, url) {
	return await environment.server.inject({ method, url });
};
