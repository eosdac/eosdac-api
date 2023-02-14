import 'reflect-metadata';

import {
	DacDirectory,
	IndexWorldsContract,
} from '@alien-worlds/eosdac-api-common';
import { Failure, Result } from '@alien-worlds/api-core';
import { Container } from 'inversify';

import { GetAllDacsUseCase } from '../get-all-dacs.use-case';
import { GetDacsInput } from '../../models/dacs.input';

/*imports*/
/*mocks*/

const indexWorldsContractService = {
	fetchDac: jest.fn(),
};

const input: GetDacsInput = {
	dacId: 'string',
	limit: 1,
};

let container: Container;
let useCase: GetAllDacsUseCase;

describe('Get All Dacs Unit tests', () => {
	beforeAll(() => {
		container = new Container();

		container
			.bind<IndexWorldsContract.Services.IndexWorldsContractService>(
				IndexWorldsContract.Services.IndexWorldsContractService.Token
			)
			.toConstantValue(indexWorldsContractService as any);
		container
			.bind<GetAllDacsUseCase>(GetAllDacsUseCase.Token)
			.to(GetAllDacsUseCase);
	});

	beforeEach(() => {
		useCase = container.get<GetAllDacsUseCase>(GetAllDacsUseCase.Token);
	});

	afterAll(() => {
		jest.clearAllMocks();
		container = null;
	});

	it('"Token" should be set', () => {
		expect(GetAllDacsUseCase.Token).not.toBeNull();
	});

	it('Should return a failure when index.worlds contract service fails', async () => {
		indexWorldsContractService.fetchDac.mockResolvedValueOnce(
			Result.withFailure(Failure.fromError(null))
		);

		const result = await useCase.execute(input);
		expect(result.isFailure).toBeTruthy();
	});

	it('should return an array of DacDirectory', async () => {
		indexWorldsContractService.fetchDac.mockResolvedValueOnce(
			Result.withContent([
				<IndexWorldsContract.Deltas.Types.DacsStruct>{
					accounts: [{ key: 2, value: 'dao.worlds' }],
					symbol: { sym: 'EYE' },
					refs: [],
				},
			])
		);

		const result = await useCase.execute(input);

		expect(result.content).toBeInstanceOf(Array);
		expect(result.content[0]).toBeInstanceOf(DacDirectory);
	});

	/*unit-tests*/
});
