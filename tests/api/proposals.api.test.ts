import * as fixtures from '../fixtures/proposals.fixture';

import { HTTP_METHOD, HTTP_STATUS } from '../common';

import { createApiTestEnvironment } from '../environments';

const environment = createApiTestEnvironment();
environment.initialize();

// meta
const Api = {
	method: HTTP_METHOD.GET,
	url: '/v1/eosdac/proposals',
};

const LIMIT_DEFAULT_VALUE = 20;
const SKIP_DEFAULT_VALUE = 0;

describe('Proposals API Test', () => {
	it('should return status 200', async () => {
		const response = await getApiResponse(Api.method, Api.url);

		expect(response.statusCode).toEqual(HTTP_STATUS.OK);
	});

	it('should return proposals list', async () => {
		const response = await getApiResponse(Api.method, Api.url);
		const jsonResp = JSON.parse(response.body);

		expect(new Set(jsonResp.results)).toEqual(
			new Set(fixtures.allProposalsList.results)
		);
		expect(jsonResp.count).toEqual(fixtures.allProposalsList.count);
	});

	describe('status query parameter', () => {
		it('should return proposals with matching status', async () => {
			const response = await getApiResponse(Api.method, `${Api.url}?status=0`);

			const jsonResp = JSON.parse(response.body);
			expect(new Set(jsonResp.results)).toEqual(
				new Set(fixtures.status0ProposalsList.results)
			);
		});

		it('should accept multiple status values and return matching proposals', async () => {
			const response = await getApiResponse(
				Api.method,
				`${Api.url}?status=0,1`
			);

			const jsonResp = JSON.parse(response.body);

			expect(new Set(jsonResp.results)).toEqual(
				new Set(fixtures.status0_1_ProposalsList.results)
			);
			expect(jsonResp.count).toEqual(fixtures.status0_1_ProposalsList.count);
		});

		it('should return empty response for invalid status', async () => {
			const response = await getApiResponse(Api.method, `${Api.url}?status=4`);

			expect(JSON.parse(response.body)).toEqual(
				fixtures.proposalsEmptyResponse
			);
		});

		it('should ignore status parameter if empty value is provided', async () => {
			const response = await getApiResponse(Api.method, `${Api.url}?status=`);

			const jsonResp = JSON.parse(response.body);

			expect(new Set(jsonResp.results)).toEqual(
				new Set(fixtures.allProposalsList.results)
			);
			expect(jsonResp.count).toEqual(fixtures.allProposalsList.count);
		});

		it('should ignore status parameter if non-numeric status is provided', async () => {
			const response = await getApiResponse(Api.method, `${Api.url}?status=a`);

			const jsonResp = JSON.parse(response.body);

			expect(new Set(jsonResp.results)).toEqual(
				new Set(fixtures.allProposalsList.results)
			);
			expect(jsonResp.count).toEqual(fixtures.allProposalsList.count);
		});
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
				`${Api.url}?limit=${fixtures.allProposalsList.count}`
			);

			const jsonResp = JSON.parse(response.body);
			expect(jsonResp.results.length).toEqual(fixtures.allProposalsList.count);
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
		const sortResults = function (results) {
			return results.sort((a, b) => {
				if (a.status - b.status !== 0) {
					return a.status - b.status;
				} else if (a.approve_voted && b.approve_voted) {
					return a.approve_voted.localeCompare(b.approve_voted);
				} else if (a.finalize_voted && b.finalize_voted) {
					return a.finalize_voted.localeCompare(b.finalize_voted);
				}
			});
		};

		it('should skip items equal to skip parameter', async () => {
			const skipParam = 1;
			const response = await getApiResponse(
				Api.method,
				`${Api.url}?skip=${skipParam}`
			);

			const jsonResp = JSON.parse(response.body);
			expect(jsonResp.results.length).toEqual(
				fixtures.allProposalsList.count - skipParam
			);
		});

		it('should not skip items when skip parameter is zero', async () => {
			const skipParam = 0;
			const response = await getApiResponse(
				Api.method,
				`${Api.url}?skip=${skipParam}`
			);

			const jsonResp = JSON.parse(response.body);
			jsonResp.results = sortResults(jsonResp.results);

			expect(jsonResp.results[0]).toEqual(
				fixtures.allProposalsList.results[skipParam]
			);
			expect(jsonResp.results.length).toEqual(fixtures.allProposalsList.count);
		});

		it('should return empty list when skip value is equal to available items', async () => {
			const response = await getApiResponse(
				Api.method,
				`${Api.url}?skip=${fixtures.allProposalsList.count}`
			);

			const jsonResp = JSON.parse(response.body);
			expect(jsonResp.results.length).toEqual(0);
		});

		it('should return error when skip parameter is negative', async () => {
			const response = await getApiResponse(Api.method, `${Api.url}?skip=-1`);

			expect(response.statusCode).toEqual(HTTP_STATUS.INTERNAL_SERVER_ERROR);
		});

		it('should use default value when skip parameter is not provided', async () => {
			const response = await getApiResponse(Api.method, `${Api.url}`);

			const jsonResp = JSON.parse(response.body);
			jsonResp.results = sortResults(jsonResp.results);

			expect(jsonResp.results[0]).toEqual(
				fixtures.allProposalsList.results[SKIP_DEFAULT_VALUE]
			);
			expect(jsonResp.results.length).toEqual(
				fixtures.allProposalsList.count - SKIP_DEFAULT_VALUE
			);
		});
	});
});

// helpers
const getApiResponse = async function (method, url) {
	return await environment.server.inject({ method, url });
};
