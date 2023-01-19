import * as fixtures from '../fixtures/dacs.fixture';

import { HTTP_METHOD, HTTP_STATUS } from '../common';

import { createApiTestEnvironment } from '../environments';

const environment = createApiTestEnvironment();
environment.initialize();

// meta
const Api = {
	method: HTTP_METHOD.GET,
	url: '/v1/eosdac/dacs',
};

const Data = {
	DacId: 'eyeke',
	Scope: 'index.worlds',
	Limit: '1',
};

describe('Dacs API Test', () => {
	it('should return status 200', async () => {
		const response = await getApiResponse(
			Api.method,
			`${Api.url}?dacId=${Data.DacId}&scope=${Data.Scope}&limit=${Data.Limit}`
		);

		expect(response.statusCode).toEqual(HTTP_STATUS.OK);
	});

	it('should return list of dacs', async () => {
		const response = await getApiResponse(
			Api.method,
			`${Api.url}?dacId=${Data.DacId}&scope=${Data.Scope}&limit=${Data.Limit}`
		);

		expect(JSON.parse(response.body)).toEqual(
			fixtures.dacsSuccessResponse
		);
	});
});

// helpers
const getApiResponse = async function (method, url) {
	return await environment.server.inject({ method, url });
};
