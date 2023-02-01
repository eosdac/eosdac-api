/* eslint-disable @typescript-eslint/no-explicit-any */
// Unit Test Code
import {
	DaoWorldsContractService,
	DaoWorldsContractServiceImpl,
} from '@alien-worlds/eosdac-api-common';
import { Failure } from '@alien-worlds/api-core';
import { anything, instance, mock, verify, when } from 'ts-mockito';
import { GetVotedCandidateIdsUseCase } from '../get-voted-candidate-ids.use-case';

describe('GetCandidatesUseCase', () => {
	let useCase: GetVotedCandidateIdsUseCase;
	let daoWorldsContractService: DaoWorldsContractService;

	beforeEach(() => {
		daoWorldsContractService = mock(DaoWorldsContractServiceImpl);
		useCase = new GetVotedCandidateIdsUseCase(instance(daoWorldsContractService));
	});

	it('should return a list of candidates', async () => {
		const dacId = 'dacid';
		const walletId = 'somewalletid';

		when(daoWorldsContractService.fetchVotes(anything())).thenResolve({
			content: [{candidates: ['candidate1', 'candidate2', 'candidate3']}],
		} as any);

		const result = await useCase.execute(walletId, dacId);

		expect(result.content).toBeInstanceOf(Array);
		
		verify(daoWorldsContractService.fetchVotes(anything())).once();
	});

	it('should return an empty array if no candidates are found', async () => {
		const dacId = 'nonexistentdacid';
		const walletId = 'somewalletid';

		when(daoWorldsContractService.fetchVotes(anything())).thenResolve({
			content: [ { candidates: [] } ],
		} as any);

		const result = await useCase.execute(walletId, dacId);

		expect(result.content).toStrictEqual([]);

		verify(daoWorldsContractService.fetchVotes(anything())).once();
	});

	it('should return a failure if an error occurs', async () => {
		const dacId = 'nonexistentdacid';
		const walletId = 'somewalletid';
		
		when(daoWorldsContractService.fetchVotes(anything())).thenResolve({
			failure: Failure.withMessage('error'),
		} as any);
		
		const result = await useCase.execute(walletId, dacId);

		expect(result).not.toBeNull();
		expect(result.isFailure).toBeTruthy();

		verify(daoWorldsContractService.fetchVotes(anything())).once();
	});
});
