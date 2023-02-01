import 'reflect-metadata';

import {
	DacsTableRow,
	IndexWorldsContractService,
} from '@alien-worlds/eosdac-api-common';
import { config } from '@config';
import { Failure, Result } from '@alien-worlds/api-core';
import { CandidatesController } from '../candidates.controller';
import { Container } from 'inversify';
import { GetCandidatesInput } from '../models/get-candidates.input';
import { ListCandidateProfilesUseCase } from '../use-cases/list-candidate-profiles.use-case';
import { LoadDacConfigError } from '@common/api/domain/errors/load-dac-config.error';

/*imports*/

/*mocks*/

jest.mock('@config');

const mockedConfig = config as jest.Mocked<typeof config>;

let container: Container;
let controller: CandidatesController;
const indexWorldsContractService = {
	fetchDacs: jest.fn(),
};
const listCandidateProfilesUseCase = {
	execute: jest.fn(),
};
const input: GetCandidatesInput = {
	walletId: 'string',
	dacId: 'string',
};

describe('Candidate Controller Unit tests', () => {
	beforeAll(() => {
		container = new Container();
		/*bindings*/
		container
			.bind<IndexWorldsContractService>(IndexWorldsContractService.Token)
			.toConstantValue(indexWorldsContractService as any);
		container
			.bind<ListCandidateProfilesUseCase>(ListCandidateProfilesUseCase.Token)
			.toConstantValue(listCandidateProfilesUseCase as any);
		container
			.bind<CandidatesController>(CandidatesController.Token)
			.to(CandidatesController);
	});

	beforeEach(() => {
		controller = container.get<CandidatesController>(
			CandidatesController.Token
		);
		indexWorldsContractService.fetchDacs.mockResolvedValue(
			Result.withContent([
				<DacsTableRow>{
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
		expect(CandidatesController.Token).not.toBeNull();
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
