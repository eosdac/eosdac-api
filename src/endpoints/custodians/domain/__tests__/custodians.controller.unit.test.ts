/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { IndexWorldsContract } from '@alien-worlds/eosdac-api-common';
import { config } from '@config';
import { Failure, Result } from '@alien-worlds/api-core';
import { CustodiansController } from '../custodians.controller';
import { Container } from 'inversify';
import { GetCustodiansInput } from '../models/get-custodians.input';
import { ListCustodianProfilesUseCase } from '../use-cases/list-custodian-profiles.use-case';
import { LoadDacConfigError } from '@common/api/domain/errors/load-dac-config.error';

/*imports*/

/*mocks*/

jest.mock('@config');

const mockedConfig = config as jest.Mocked<typeof config>;

let container: Container;
let controller: CustodiansController;
const indexWorldsContractService = {
	fetchDacs: jest.fn(),
};
const listCandidateProfilesUseCase = {
	execute: jest.fn(),
};
const input: GetCustodiansInput = {
	dacId: 'string',
};

describe('Candidate Controller Unit tests', () => {
	beforeAll(() => {
		container = new Container();
		/*bindings*/
		container
			.bind<IndexWorldsContract.Services.IndexWorldsContractService>(
				IndexWorldsContract.Services.IndexWorldsContractService.Token
			)
			.toConstantValue(indexWorldsContractService as any);
		container
			.bind<ListCustodianProfilesUseCase>(ListCustodianProfilesUseCase.Token)
			.toConstantValue(listCandidateProfilesUseCase as any);
		container
			.bind<CustodiansController>(CustodiansController.Token)
			.to(CustodiansController);
	});

	beforeEach(() => {
		controller = container.get<CustodiansController>(
			CustodiansController.Token
		);
		indexWorldsContractService.fetchDacs.mockResolvedValue(
			Result.withContent([
				<IndexWorldsContract.Deltas.Types.DacsStruct>{
					accounts: [{ key: 2, value: 'dao.worlds' }],
					symbol: {
						sym: 'EYE',
					},
					refs: [],
				},
			])
		);
		listCandidateProfilesUseCase.execute.mockResolvedValue(
			Result.withContent([])
		);
	});

	afterAll(() => {
		jest.clearAllMocks();
		container = null;
	});

	it('"Token" should be set', () => {
		expect(CustodiansController.Token).not.toBeNull();
	});

	it('Should execute ListCandidateProfilesUseCase', async () => {
		await controller.list(input);
		expect(listCandidateProfilesUseCase.execute).toBeCalled();
	});

	it('Should result with LoadDacConfigError when dac config could not be loaded', async () => {
		mockedConfig.dac.nameCache.get = () => null;
		indexWorldsContractService.fetchDacs.mockResolvedValue(
			Result.withFailure(Failure.withMessage('error'))
		);
		const result = await controller.list(input);
		expect(result.failure.error).toBeInstanceOf(LoadDacConfigError);
	});
	/*unit-tests*/
});
