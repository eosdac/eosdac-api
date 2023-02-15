/* eslint-disable @typescript-eslint/no-explicit-any */
// Unit Test Code
import { Container, Failure } from '@alien-worlds/api-core';

import { DaoWorldsContract } from '@alien-worlds/eosdac-api-common';
import { GetCandidatesUseCase } from '../get-candidates.use-case';

const Entities = DaoWorldsContract.Deltas.Entities;

describe('GetCandidatesUseCase', () => {
	let container: Container;
	let useCase: GetCandidatesUseCase;

	const mockService = {
		fetchCandidate: jest.fn(),
	};

	beforeAll(() => {
		container = new Container();

		container
			.bind<GetCandidatesUseCase>(GetCandidatesUseCase.Token)
			.toConstantValue(new GetCandidatesUseCase(mockService as any));
	});

	beforeEach(() => {
		useCase = container.get<GetCandidatesUseCase>(GetCandidatesUseCase.Token);
	});

	afterAll(() => {
		jest.clearAllMocks();
		container = null;
	});

	it('should return a list of candidates', async () => {
		const dacId = 'testdac';
		mockService.fetchCandidate.mockResolvedValue({
			content: [
				{
					requestedpay: '10000 TLM',
					total_vote_power: 1,
					rank: 1,
					gap_filler: 1,
					is_active: true,
					avg_vote_timestamp: new Date()
				},
			],
		});
		const result = await useCase.execute(dacId);

		expect(result.content).toBeInstanceOf(Array);

		const candidate = result
			.content[0] as DaoWorldsContract.Deltas.Entities.Candidate;

		expect(candidate).toBeInstanceOf(Entities.Candidate);
	});

	it('should return an empty array if no candidates are found', async () => {
		const dacId = 'emptydac';
		mockService.fetchCandidate.mockResolvedValue({
			content: [],
		});
		const result = await useCase.execute(dacId);

		expect(result.content).toEqual([]);
	});

	it('should return a failure if the service fails', async () => {
		const dacId = 'faileddac';
		mockService.fetchCandidate.mockResolvedValue({
			failure: Failure.withMessage('error'),
		});
		const result = await useCase.execute(dacId);

		expect(result.isFailure).toBeTruthy();
	});
});
