import * as fixtures from '../fixtures/custodians.fixture';

import { HTTP_METHOD, HTTP_STATUS } from '../common';

import { createApiTestEnvironment } from '../environments';

const environment = createApiTestEnvironment();
environment.initialize();

const Data = {
	DacId: 'nerix'
};

// meta
const Api = {
	method: HTTP_METHOD.GET,
	url: `/v1/dao/${Data.DacId}/custodians`,
};

describe('Custodians API Test', () => {
	it('should return status 200', async () => {
		const response = await getApiResponse(Api.method, `${Api.url}`);

		expect(response.statusCode).toEqual(HTTP_STATUS.OK);
	});

	it('should return list of custodians', async () => {
		const response = await getApiResponse(Api.method, `${Api.url}`);

		expect(JSON.parse(response.body)).toEqual(
			fixtures.custodiansSuccessResponse
		);
	});
});

// helpers
const getApiResponse = async function (method, url) {
	return await environment.server.inject({ method, url });
};
