const { createApiTestEnvironment } = require('../environments');
const { HTTP_METHOD, HTTP_STATUS } = require('../common');
const fixtures = require('../fixtures/referendums.fixture');

const environment = createApiTestEnvironment();
environment.initialize();

// meta
const Api = {
	method: HTTP_METHOD.GET,
	url: '/v1/eosdac/referendums',
};

const Data = {
	Status: 46876837,
};

const LIMIT_DEFAULT_VALUE = 20;
const SKIP_DEFAULT_VALUE = 0;

/* TODO: blockchain does not have data for referendums for now but after having data, we need to
 *  - write test to verify proper successful response
 *  - write test to verify if skip param actually skips items equal to skip parameter
 *  - write test to verify behavior when skip parameter receives a negative value
 */

describe('Referendums API Test', () => {
	it('should return status 200', async () => {
		const response = await getApiResponse(Api.method, Api.url);

		expect(response.statusCode).toEqual(HTTP_STATUS.OK);
	});

	it('should return empty response', async () => {
		const response = await getApiResponse(Api.method, Api.url);

		expect(JSON.parse(response.body)).toEqual(fixtures.emptyResponse);
	});

	it('should accept status parameter', async () => {
		const response = await getApiResponse(
			Api.method,
			`${Api.url}?status=${Data.Status}`
		);

		expect(JSON.parse(response.body)).toEqual(fixtures.emptyResponse);
	});

	describe('limit query parameter', () => {
		it('should return items less than or equal to limit parameter', async () => {
			const limitParam = 1;
			const response = await getApiResponse(
				Api.method,
				`${Api.url}?limit=${limitParam}`
			);

			const jsonResp = JSON.parse(response.body);
			expect(jsonResp.results.length).toBeLessThanOrEqual(limitParam);
		});

		it('should return all items when limit is greater than or equal to count of available items', async () => {
			const response = await getApiResponse(
				Api.method,
				`${Api.url}?limit=${fixtures.emptyResponse.count}`
			);

			const jsonResp = JSON.parse(response.body);
			expect(jsonResp.results.length).toEqual(fixtures.emptyResponse.count);
		});

		it('should use default limit when provided limit is zero', async () => {
			const response = await getApiResponse(Api.method, `${Api.url}?limit=0`);

			const jsonResp = JSON.parse(response.body);
			expect(jsonResp.results.length).toBeLessThanOrEqual(LIMIT_DEFAULT_VALUE);
		});

		it('should use default limit when provided limit is negative', async () => {
			const response = await getApiResponse(Api.method, `${Api.url}?limit=-1`);

			const jsonResp = JSON.parse(response.body);
			expect(jsonResp.results.length).toBeLessThanOrEqual(LIMIT_DEFAULT_VALUE);
		});
	});

	describe('skip query parameter', () => {
		it('should not skip items when skip parameter is zero', async () => {
			const skipParam = 0;
			const response = await getApiResponse(
				Api.method,
				`${Api.url}?skip=${skipParam}`
			);

			const jsonResp = JSON.parse(response.body);

			expect(jsonResp.results[0]).toEqual(
				fixtures.emptyResponse.results[skipParam]
			);
			expect(jsonResp.results.length).toEqual(fixtures.emptyResponse.count);
		});

		it('should return empty list when skip value is equal to available items', async () => {
			const response = await getApiResponse(
				Api.method,
				`${Api.url}?skip=${fixtures.emptyResponse.count}`
			);

			const jsonResp = JSON.parse(response.body);
			expect(jsonResp.results.length).toEqual(0);
		});

		it('should use default value when skip parameter is not provided', async () => {
			const response = await getApiResponse(Api.method, `${Api.url}`);

			const jsonResp = JSON.parse(response.body);

			expect(jsonResp.results[0]).toEqual(
				fixtures.emptyResponse.results[SKIP_DEFAULT_VALUE]
			);
			expect(jsonResp.results.length).toEqual(
				fixtures.emptyResponse.count - SKIP_DEFAULT_VALUE
			);
		});
	});
});

// helpers
const getApiResponse = async function (method, url) {
	return await environment.server.inject({ method, url });
};
