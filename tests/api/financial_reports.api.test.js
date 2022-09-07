const { createApiTestEnvironment } = require('../environments');
const { HTTP_METHOD, HTTP_STATUS } = require('../common');

const environment = createApiTestEnvironment();
environment.initialize();

// meta
const Api = {
	method: HTTP_METHOD.GET,
	url: '/v1/eosdac/financial_reports',
};

const Data = {
	Account: 'token.worlds',
	Start: '1600176000000',
	End: '1660176000000',
};

/* TODO: after getting succesful response for the endpoint, we need to
 *  - write test to verify proper successful response
 *  - write test to verify empty response
 *  - write test to verify behavior when account param is not provided
 *  - write test to verify behavior when end param is not provided
 */

describe('Financial Reports API Test', () => {
	it('should return error if start is not provided', async () => {
		const response = await getApiResponse(
			Api.method,
			`${Api.url}?account=${Data.Account}&end=${Data.End}`
		);
		const jsonResp = JSON.parse(response.body);

		expect(response.statusCode).toEqual(HTTP_STATUS.BAD_REQUEST);
		expect(jsonResp.message).toEqual(
			"querystring should have required property 'start'"
		);
	});
});

// helpers
const getApiResponse = async function (method, url) {
	return await environment.server.inject({ method, url });
};
