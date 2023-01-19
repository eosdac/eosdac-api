import * as fixtures from '../fixtures/profile.fixture';

import { HTTP_METHOD, HTTP_STATUS } from '../common';

import { createApiTestEnvironment } from '../environments';

const environment = createApiTestEnvironment();
environment.initialize();

const Data = {
	DACId: 'nerix',
	Account: 'suzqu.wam',
};

// meta
const Api = {
	method: HTTP_METHOD.GET,
	url: `/v1/eosdac/${Data.DACId}/profile`,
};

describe('Get member profile API Test', () => {
	it('should return status 200', async () => {
		const response = await getApiResponse(
			Api.method,
			`${Api.url}?account=${Data.Account}`
		);

		expect(response.statusCode).toEqual(HTTP_STATUS.OK);
	});

	it('should return member profile', async () => {
		const response = await getApiResponse(
			Api.method,
			`${Api.url}?account=${Data.Account}`
		);

		expect(JSON.parse(response.body)).toEqual(fixtures.profileResponse);
	});

	it('should return empty response when account not found', async () => {
		const response = await getApiResponse(
			Api.method,
			`${Api.url}?account=dummy`
		);

		expect(JSON.parse(response.body)).toEqual(fixtures.profileNotFound);
	});

	it('should return error when account is not provided', async () => {
		const response = await getApiResponse(Api.method, `${Api.url}`);

		expect(response.statusCode).toEqual(HTTP_STATUS.INTERNAL_SERVER_ERROR);
	});
});

// helpers
const getApiResponse = async function (method, url) {
	return await environment.server.inject({ method, url });
};
