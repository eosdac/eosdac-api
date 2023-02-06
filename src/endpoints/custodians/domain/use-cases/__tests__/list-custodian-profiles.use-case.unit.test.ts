/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { DacDirectory, IndexWorldsContract } from '@alien-worlds/eosdac-api-common';
import { Failure, Result } from '@alien-worlds/api-core';
import { Container } from 'inversify';
import { GetCustodiansUseCase } from '../get-custodians.use-case';
import { GetMembersAgreedTermsUseCase } from '../../../../candidates/domain/use-cases/get-members-agreed-terms.use-case';
import { GetMemberTermsUseCase } from '../../../../candidates/domain/use-cases/get-member-terms.use-case';
import { GetProfilesUseCase } from '../../../../profile/domain/use-cases/get-profiles.use-case';
import { ListCustodianProfilesUseCase } from '../list-custodian-profiles.use-case';

/*imports*/

/*mocks*/

let container: Container;
let useCase: ListCustodianProfilesUseCase;

const getCustodiansUseCase = {
	execute: jest.fn(),
};
const getProfilesUseCase = {
	execute: jest.fn(),
};
const getMemberTermsUseCase = {
	execute: jest.fn(),
};
const getMembersAgreedTermsUseCase = {
	execute: jest.fn(),
};
const dacConfig = DacDirectory.fromStruct(<IndexWorldsContract.Deltas.Types.DacsStruct>{
	accounts: [{ key: 2, value: 'dao.worlds' }],
	symbol: {
		sym: 'EYE',
	},
	refs: [],
});

describe('ListCustodianProfilesUseCase Unit tests', () => {
	beforeAll(() => {
		container = new Container();
		/*bindings*/
		container
			.bind<GetCustodiansUseCase>(GetCustodiansUseCase.Token)
			.toConstantValue(getCustodiansUseCase as any);
		container
			.bind<GetProfilesUseCase>(GetProfilesUseCase.Token)
			.toConstantValue(getProfilesUseCase as any);
		container
			.bind<GetMemberTermsUseCase>(GetMemberTermsUseCase.Token)
			.toConstantValue(getMemberTermsUseCase as any);
		container
			.bind<GetMembersAgreedTermsUseCase>(GetMembersAgreedTermsUseCase.Token)
			.toConstantValue(getMembersAgreedTermsUseCase as any);
		container
			.bind<ListCustodianProfilesUseCase>(ListCustodianProfilesUseCase.Token)
			.to(ListCustodianProfilesUseCase);
	});

	beforeEach(() => {
		useCase = container.get<ListCustodianProfilesUseCase>(
			ListCustodianProfilesUseCase.Token
		);
		getCustodiansUseCase.execute.mockResolvedValue(Result.withContent([]));
		getProfilesUseCase.execute.mockResolvedValue(Result.withContent([]));
		getMemberTermsUseCase.execute.mockResolvedValue(Result.withContent({}));
		getMembersAgreedTermsUseCase.execute.mockResolvedValue(
			Result.withContent(new Map())
		);
	});

	afterAll(() => {
		jest.clearAllMocks();
		container = null;
	});

	it('"Token" should be set', () => {
		expect(ListCustodianProfilesUseCase.Token).not.toBeNull();
	});

	it('Should execute GetCustodiansUseCase', async () => {
		await useCase.execute('dacId', dacConfig);
		expect(getCustodiansUseCase.execute).toBeCalled();
	});

	it('Should return failure when GetCustodiansUseCase fails', async () => {
		getCustodiansUseCase.execute.mockResolvedValue(
			Result.withFailure(Failure.withMessage('error'))
		);

		const result = await useCase.execute('dacId', dacConfig);
		expect(result.failure).toBeTruthy();
	});

	it('Should execute GetProfilesUseCase', async () => {
		await useCase.execute('dacId', dacConfig);
		expect(getProfilesUseCase.execute).toBeCalled();
	});

	it('Should return failure when GetProfilesUseCase fails', async () => {
		getProfilesUseCase.execute.mockResolvedValue(
			Result.withFailure(Failure.withMessage('error'))
		);

		const result = await useCase.execute('dacId', dacConfig);
		expect(result.failure).toBeTruthy();
	});

	it('Should execute GetMemberTermsUseCase', async () => {
		await useCase.execute('dacId', dacConfig);
		expect(getMemberTermsUseCase.execute).toBeCalled();
	});

	it('Should return failure when GetMemberTermsUseCase fails', async () => {
		getMemberTermsUseCase.execute.mockResolvedValue(
			Result.withFailure(Failure.withMessage('error'))
		);

		const result = await useCase.execute('dacId', dacConfig);
		expect(result.failure).toBeTruthy();
	});

	it('Should execute GetMembersAgreedTermsUseCase', async () => {
		await useCase.execute('dacId', dacConfig);
		expect(getMembersAgreedTermsUseCase.execute).toBeCalled();
	});

	it('Should return failure when GetMembersAgreedTermsUseCase fails', async () => {
		getMembersAgreedTermsUseCase.execute.mockResolvedValue(
			Result.withFailure(Failure.withMessage('error'))
		);

		const result = await useCase.execute('dacId', dacConfig);
		expect(result.failure).toBeTruthy();
	});

	/*unit-tests*/
});
