const { createApiTestEnvironment } = require('../environments');
const { HTTP_METHOD, HTTP_STATUS } = require('../common');
const fixtures = require('../fixtures/balance_timeline.fixture');

const environment = createApiTestEnvironment();
environment.initialize();

// meta
const Api = {
	method: HTTP_METHOD.GET,
	url: '/v1/eosdac/balance_timeline',
};

const Data = {
	Contract: 'token.worlds',
	Account: 'federation',
	Symbol: 'NER',
};

describe('Balance timeline API Test', () => {
	it('should return status 200', async () => {
		const response = await getApiResponse(
			Api.method,
			`${Api.url}?account=${Data.Account}&contract=${Data.Contract}&symbol=${Data.Symbol}`
		);

		expect(response.statusCode).toEqual(HTTP_STATUS.OK);
	});

	it('should return success reponse', async () => {
		const response = await getApiResponse(
			Api.method,
			`${Api.url}?account=${Data.Account}&contract=${Data.Contract}&symbol=${Data.Symbol}`
		);

		expect(JSON.parse(response.body)).toEqual(
			fixtures.balanceTimelineOneItemResponse
		);
	});

	describe('start and end block params', () => {
		// TODO: figure out a way to verify this
		it('should return results from last six months when start and end block is not provided', async () => {
			const response = await getApiResponse(
				Api.method,
				`${Api.url}?account=${Data.Account}&contract=${Data.Contract}&symbol=${Data.Symbol}`
			);

			expect(JSON.parse(response.body)).toEqual(
				fixtures.balanceTimelineOneItemResponse
			);
		});

		describe('start block param', () => {
			it('should filter results greater than or equal to start block number', async () => {
				const startBlockParam = 105377017;

				const response = await getApiResponse(
					Api.method,
					`${Api.url}?account=${Data.Account}&contract=${Data.Contract}&symbol=${Data.Symbol}&start_block=${startBlockParam}`
				);
				const jsonResp = JSON.parse(response.body);

				expect(jsonResp.count).toEqual(
					fixtures.balanceTimelineStartParamResponse.count
				);
				expect(jsonResp.results.slice(0, -1)).toEqual(
					fixtures.balanceTimelineStartParamResponse.results.slice(0, -1)
				);
			});
		});

		describe('end block param', () => {
			it('should filter results less than or equal to start block number', async () => {
				const endBlockParam = 105377352;

				const response = await getApiResponse(
					Api.method,
					`${Api.url}?account=${Data.Account}&contract=${Data.Contract}&symbol=${Data.Symbol}&end_block=${endBlockParam}`
				);
				const jsonResp = JSON.parse(response.body);

				expect(jsonResp.count).toEqual(
					fixtures.balanceTimelineEndParamResponse.count
				);
				expect(jsonResp.results.slice(0, -1)).toEqual(
					fixtures.balanceTimelineEndParamResponse.results.slice(0, -1)
				);
			});
		});
	});
});

// helpers
const getApiResponse = async function (method, url) {
	return await environment.server.inject({ method, url });
};
