import { createApiTestEnvironment } from '../environments';

import { HTTP_METHOD, HTTP_STATUS } from '../common';
import * as fixtures from '../fixtures/proposals_inbox.fixture';

const environment = createApiTestEnvironment();
environment.initialize();

// meta
const Api = {
	method: HTTP_METHOD.GET,
	url: `/v1/eosdac/proposals_inbox`,
};

const Data = {
	Account: 'veniam consectetur',
	LimitDefaultValue: 30,
	SkipDefaultValue: 0,
};

describe('Proposals inbox API Test', () => {
	it('should return status 200', async () => {
		const response = await getApiResponse(
			Api.method,
			`${Api.url}?account=${Data.Account}`
		);

		expect(response.statusCode).toEqual(HTTP_STATUS.OK);
	});

	it('should return success response', async () => {
		const response = await getApiResponse(
			Api.method,
			`${Api.url}?account=${Data.Account}`
		);

		expect(JSON.parse(response.body)).toEqual(
			fixtures.proposalsInboxSuccessResponse
		);
	});

	it('should return empty response', async () => {
		const response = await getApiResponse(
			Api.method,
			`${Api.url}?account=${Data.Account}`
		);

		expect(JSON.parse(response.body)).toEqual(
			fixtures.proposalsInboxSuccessResponse
		);
	});

	it('should return error if account is not provided', async () => {
		const response = await getApiResponse(Api.method, `${Api.url}`);

		const jsonResp = JSON.parse(response.body);

		expect(response.statusCode).toEqual(HTTP_STATUS.BAD_REQUEST);
		expect(jsonResp.message).toEqual(
			"querystring should have required property 'account'"
		);
	});
});

// helpers
const getApiResponse = async function (method, url) {
	return await environment.server.inject({ method, url });
};
