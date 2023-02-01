/* eslint-disable @typescript-eslint/no-explicit-any */
// Unit Test Code
import { Failure } from '@alien-worlds/api-core';
import { Candidate } from '@alien-worlds/eosdac-api-common';
import { Container } from 'inversify';
import { GetCandidatesUseCase } from '../get-candidates.use-case';

describe('GetCandidatesUseCase', () => {
	let container: Container;
	let useCase: GetCandidatesUseCase;

	const mockService = {
		fetchCandidates: jest.fn(),
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
		mockService.fetchCandidates.mockResolvedValue({
			content: [Candidate.fromTableRow({})],
		});
		const result = await useCase.execute(dacId);

		expect(result.content).toBeInstanceOf(Array);

		const candidate = result.content[0] as Candidate;

		expect(candidate).toBeInstanceOf(Candidate);
	});

	it('should return an empty array if no candidates are found', async () => {
		const dacId = 'emptydac';
		mockService.fetchCandidates.mockResolvedValue({
			content: [],
		});
		const result = await useCase.execute(dacId);

		expect(result.content).toEqual([]);
	});

	it('should return a failure if the service fails', async () => {
		const dacId = 'faileddac';
		mockService.fetchCandidates.mockResolvedValue({
			failure: Failure.withMessage('error'),
		});
		const result = await useCase.execute(dacId);

		expect(result.isFailure).toBeTruthy();
	});
});
