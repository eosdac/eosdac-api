import * as fixtures from '../fixtures/candidates.fixture';

import { HTTP_METHOD, HTTP_STATUS } from '../common';

import { createApiTestEnvironment } from '../environments';

const environment = createApiTestEnvironment();
environment.initialize();

const Data = {
	DacId: 'nerix',
	WalletId: '.1uqy.wam',
};

// meta
const Api = {
	method: HTTP_METHOD.GET,
	url: `/v1/eosdac/${Data.DacId}/candidates`,
};

describe('Candidates API Test', () => {
	it('should return status 200', async () => {
		const response = await getApiResponse(
			Api.method,
			`${Api.url}?walletId=${Data.WalletId}`
		);

		expect(response.statusCode).toEqual(HTTP_STATUS.OK);
	});

	it('should return list of candidates', async () => {
		const response = await getApiResponse(
			Api.method,
			`${Api.url}?walletId=${Data.WalletId}`
		);

		expect(JSON.parse(response.body)).toEqual(
			fixtures.candidatesSuccessResponse
		);
	});
});

// helpers
const getApiResponse = async function (method, url) {
	return await environment.server.inject({ method, url });
};
