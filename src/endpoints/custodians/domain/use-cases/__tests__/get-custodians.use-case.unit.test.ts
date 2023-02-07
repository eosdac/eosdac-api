/* eslint-disable @typescript-eslint/no-explicit-any */
// Unit Test Code
import { Container } from 'inversify';
import { DaoWorldsContract } from '@alien-worlds/eosdac-api-common';
import { Failure } from '@alien-worlds/api-core';
import { GetCustodiansUseCase } from '../get-custodians.use-case';

describe('GetCustodiansUseCase', () => {
	let container: Container;
	let useCase: GetCustodiansUseCase;

	const mockService = {
		fetchCustodian: jest.fn(),
	};

	beforeAll(() => {
		container = new Container();

		container
			.bind<GetCustodiansUseCase>(GetCustodiansUseCase.Token)
			.toConstantValue(new GetCustodiansUseCase(mockService as any));
	});

	beforeEach(() => {
		useCase = container.get<GetCustodiansUseCase>(GetCustodiansUseCase.Token);
	});

	afterAll(() => {
		jest.clearAllMocks();
		container = null;
	});

	it('should return a list of custodians', async () => {
		const dacId = 'testdac';
		mockService.fetchCustodian.mockResolvedValue({
			content: [
				{
					cust_name: 'custodian1',
					requestedpay: '10000000 TLM',
					total_vote_power: 1,
					rank: 1,
					number_voters: 1,
					avg_vote_time_stamp: new Date().toISOString(),
				},
			],
		});
		const result = await useCase.execute(dacId);

		expect(result.content).toBeInstanceOf(Array);

		const candidate = result
			.content[0] as DaoWorldsContract.Deltas.Entities.Custodian;

		expect(candidate).toBeInstanceOf(
			DaoWorldsContract.Deltas.Entities.Custodian
		);
	});

	it('should return an empty array if no candidates are found', async () => {
		const dacId = 'emptydac';
		mockService.fetchCustodian.mockResolvedValue({
			content: [],
		});
		const result = await useCase.execute(dacId);

		expect(result.content).toEqual([]);
	});

	it('should return a failure if the service fails', async () => {
		const dacId = 'faileddac';
		mockService.fetchCustodian.mockResolvedValue({
			failure: Failure.withMessage('error'),
		});
		const result = await useCase.execute(dacId);

		expect(result.isFailure).toBeTruthy();
	});
});
