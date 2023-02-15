/* eslint-disable @typescript-eslint/no-explicit-any */

// Unit test code
import { anything, instance, mock, verify, when } from 'ts-mockito';

import { Failure } from '@alien-worlds/api-core';
import { GetMembersAgreedTermsUseCase } from '../get-members-agreed-terms.use-case';
import { TokenWorldsContract } from '@alien-worlds/eosdac-api-common';

describe('GetMembersAgreedTermsUseCase', () => {
	let getMembersAgreedTermsUseCase: GetMembersAgreedTermsUseCase;
	let tokenWorldsContractService: TokenWorldsContract.Services.TokenWorldsContractService;

	beforeEach(() => {
		tokenWorldsContractService = mock(
			TokenWorldsContract.Services.TokenWorldsContractServiceImpl
		);
		getMembersAgreedTermsUseCase = new GetMembersAgreedTermsUseCase(
			instance(tokenWorldsContractService)
		);
	});

	it('should return a map of accounts and agreed terms version', async () => {
		const dacId = 'daccustodian';
		const accounts = ['account1', 'account2'];

		const rows = [
			{ sender: 'account1', agreedtermsversion: 2 },
			{ sender: 'account2', agreedtermsversion: 3 },
		];

		when(tokenWorldsContractService.fetchMembers(anything())).thenResolve({
			content: rows,
		} as any);

		const result = await getMembersAgreedTermsUseCase.execute(dacId, accounts);

		expect(result.content).toEqual(
			new Map([
				['account1', 2],
				['account2', 3],
			])
		);

		verify(tokenWorldsContractService.fetchMembers(anything())).once();
	});

	it('should return a failure if fetching members fails', async () => {
		const dacId = 'daccustodian';
		const accounts = ['account1', 'account2'];

		when(tokenWorldsContractService.fetchMembers(anything())).thenResolve({
			failure: Failure.withMessage('error'),
		} as any);

		const result = await getMembersAgreedTermsUseCase.execute(dacId, accounts);

		expect(result.failure).toBeTruthy();

		verify(tokenWorldsContractService.fetchMembers(anything())).once();
	});
});
// Unit Test Code
// import { Container, Failure } from '@alien-worlds/api-core';
// import { GetMemberTermsUseCase } from '../get-member-terms.use-case';
// import { MemberTerms } from '@alien-worlds/eosdac-api-common';

// describe('GetMemberTermsUseCase', () => {
// 	let container: Container;
// 	let useCase: GetMemberTermsUseCase;

// 	const mockService = {
// 		fetchMembersTerms: jest.fn(),
// 	};

// 	beforeAll(() => {
// 		container = new Container();

// 		container
// 			.bind<GetMemberTermsUseCase>(GetMemberTermsUseCase.Token)
// 			.toConstantValue(new GetMemberTermsUseCase(mockService as any));
// 	});

// 	beforeEach(() => {
// 		useCase = container.get<GetMemberTermsUseCase>(GetMemberTermsUseCase.Token);
// 	});

// 	afterAll(() => {
// 		jest.clearAllMocks();
// 		container = null;
// 	});

// 	it('should return a Member Terms object', async () => {
// 		const result = await useCase.execute('dac');
// 		expect(result.content).toBeInstanceOf(MemberTerms);
// 	});

// 	it('should return a failure if the service fails', async () => {
// 		const result = await useCase.execute('dac');

// 		expect(result.failure).toBeInstanceOf(Failure);
// 	});
// });
