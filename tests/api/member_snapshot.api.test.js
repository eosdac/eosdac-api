const { createApiTestEnvironment } = require('../environments');
const { HTTP_METHOD, HTTP_STATUS } = require('../common');
const fixtures = require('../fixtures/member_snapshot.fixture');

const environment = createApiTestEnvironment();
environment.initialize();

// meta
const Api = {
	method: HTTP_METHOD.GET,
	url: '/v1/eosdac/member_snapshot',
};

const Data = {
	Contract: 'token.worlds',
	Symbol: '4,TESTA',
	BlockNum: '105578904',
};

describe('Member Snapshot API Test', () => {
	it('should return status 200', async () => {
		const response = await getApiResponse(Api.method, Api.url);

		expect(response.statusCode).toEqual(HTTP_STATUS.OK);
	});

	it('should return success response', async () => {
		const apiUrl = `${Api.url}?contract=${Data.Contract}&symbol=${Data.Symbol}&block_num=${Data.BlockNum}`;
		const response = await getApiResponse(Api.method, apiUrl);

		expect(JSON.parse(response.body)).toEqual(fixtures.successResponse);
	});

	it('should return empty response when contract does not match', async () => {
		const apiUrl = `${Api.url}?contract=dao.worlds&symbol=${Data.Symbol}&block_num=${Data.BlockNum}`;
		const response = await getApiResponse(Api.method, apiUrl);

		expect(JSON.parse(response.body)).toEqual(fixtures.emptyResponse);
	});

	it('should return response without providing symbol', async () => {
		const apiUrl = `${Api.url}?contract=${Data.Contract}&block_num=${Data.BlockNum}`;
		const response = await getApiResponse(Api.method, apiUrl);

		expect(JSON.parse(response.body)).toEqual(fixtures.noSymbolSuccessResponse);
	});
});

// helpers
const getApiResponse = async function (method, url) {
	return await environment.server.inject({ method, url });
};
