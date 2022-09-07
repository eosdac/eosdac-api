const { createApiTestEnvironment } = require('../environments');
const { HTTP_METHOD, HTTP_STATUS } = require('../common');
const fixtures = require('../fixtures/profile.fixture');

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

		expect(JSON.parse(response.body)).toEqual(fixtures.emptyProfile);
	});

	it('should return error when account is not provided', async () => {
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
