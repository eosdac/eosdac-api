import * as fixtures from '../fixtures/candidates.fixture';

import { HTTP_METHOD, HTTP_STATUS } from '../common';

import { createApiTestEnvironment } from '../environments';

const environment = createApiTestEnvironment();
environment.initialize();

// meta
const Api = {
	method: HTTP_METHOD.GET,
	url: '/v1/eosdac/candidates',
};

const LIMIT_DEFAULT_VALUE = 20;
const SKIP_DEFAULT_VALUE = 0;

describe('Candidates API Test', () => {
	it('should return status 200', async () => {
		const response = await getApiResponse(Api.method, Api.url);

		expect(response.statusCode).toEqual(HTTP_STATUS.OK);
	});

	it('should return candidates list', async () => {
		const response = await getApiResponse(Api.method, Api.url);

		expect(JSON.parse(response.body)).toEqual(fixtures.candidatesResponse);
	});

	describe('limit parameter', () => {
		it('should return items less than or equal to limit parameter', async () => {
			const limitParam = 1;
			const response = await getApiResponse(
				Api.method,
				`${Api.url}?limit=${limitParam}`
			);

			const jsonResponse = JSON.parse(response.body);
			expect(jsonResponse.results.length).toBeLessThanOrEqual(limitParam);
		});

		it('should return all items when limit is greater than or equal to count of available items', async () => {
			const response = await getApiResponse(
				Api.method,
				`${Api.url}?limit=${fixtures.candidatesResponse.count}`
			);

			const jsonResponse = JSON.parse(response.body);
			expect(jsonResponse.results.length).toEqual(
				fixtures.candidatesResponse.count
			);
		});

		it('should use default limit when provided limit is zero', async () => {
			const response = await getApiResponse(Api.method, `${Api.url}?limit=0`);

			const jsonResponse = JSON.parse(response.body);
			expect(jsonResponse.results.length).toBeLessThanOrEqual(
				LIMIT_DEFAULT_VALUE
			);
		});

		it('should use default limit when provided limit is negative', async () => {
			const response = await getApiResponse(Api.method, `${Api.url}?limit=-1`);

			const jsonResponse = JSON.parse(response.body);
			expect(jsonResponse.results.length).toBeLessThanOrEqual(
				LIMIT_DEFAULT_VALUE
			);
		});
	});

	describe('skip parameter', () => {
		it('should skip items equal to skip parameter', async () => {
			const skipParam = 1;
			const response = await getApiResponse(
				Api.method,
				`${Api.url}?skip=${skipParam}`
			);

			const jsonResponse = JSON.parse(response.body);
			expect(jsonResponse.results[0]).toEqual(
				fixtures.candidatesResponse.results[skipParam]
			);
			expect(jsonResponse.results.length).toEqual(
				fixtures.candidatesResponse.count - skipParam
			);
		});

		it('should not skip items when skip parameter is zero', async () => {
			const skipParam = 0;
			const response = await getApiResponse(
				Api.method,
				`${Api.url}?skip=${skipParam}`
			);

			const jsonResponse = JSON.parse(response.body);
			expect(jsonResponse.results[0]).toEqual(
				fixtures.candidatesResponse.results[skipParam]
			);
			expect(jsonResponse.results.length).toEqual(
				fixtures.candidatesResponse.count
			);
		});

		it('should return empty list when skip value is equal to available items', async () => {
			const response = await getApiResponse(
				Api.method,
				`${Api.url}?skip=${fixtures.candidatesResponse.count}`
			);

			const jsonResponse = JSON.parse(response.body);
			expect(jsonResponse.results.length).toEqual(0);
		});

		it('should offset elements from the end when skip parameter is negative', async () => {
			const skipParam = -1;
			const response = await getApiResponse(
				Api.method,
				`${Api.url}?skip=${skipParam}`
			);

			const jsonResponse = JSON.parse(response.body);
			expect(jsonResponse.results[0].candidate_name).toEqual('ahwqw.wam');
			expect(jsonResponse.results.length).toEqual(1);
		});

		it('should use default value when skip parameter is not provided', async () => {
			const response = await getApiResponse(Api.method, `${Api.url}`);

			const jsonResponse = JSON.parse(response.body);

			expect(jsonResponse.results[SKIP_DEFAULT_VALUE]).toEqual(
				fixtures.candidatesResponse.results[SKIP_DEFAULT_VALUE]
			);
			expect(jsonResponse.results.length).toEqual(
				fixtures.candidatesResponse.count - SKIP_DEFAULT_VALUE
			);
		});
	});
});

// helpers
const getApiResponse = async function (method, url) {
	return await environment.server.inject({ method, url });
};
