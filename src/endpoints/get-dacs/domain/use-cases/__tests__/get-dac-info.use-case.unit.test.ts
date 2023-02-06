import { Failure, Result } from '@alien-worlds/api-core';
import { DaoWorldsContract } from '@alien-worlds/eosdac-api-common';
import { Container } from 'inversify';

import { GetDacInfoUseCase } from '../get-dac-info.use-case';

import 'reflect-metadata';

/*imports*/
/*mocks*/

const daoWorldsContractService = {
	fetchDacGlobals: jest.fn(),
};

let container: Container;
let useCase: GetDacInfoUseCase;

describe('Get Dac Info Unit tests', () => {
	beforeAll(() => {
		container = new Container();

		container
			.bind<DaoWorldsContract.Services.DaoWorldsContractService>(
				DaoWorldsContract.Services.DaoWorldsContractService.Token
			)
			.toConstantValue(daoWorldsContractService as any);
		container
			.bind<GetDacInfoUseCase>(GetDacInfoUseCase.Token)
			.to(GetDacInfoUseCase);
	});

	beforeEach(() => {
		useCase = container.get<GetDacInfoUseCase>(GetDacInfoUseCase.Token);
	});

	afterAll(() => {
		jest.clearAllMocks();
		container = null;
	});

	it('"Token" should be set', () => {
		expect(GetDacInfoUseCase.Token).not.toBeNull();
	});

	it('Should return a failure when dao.worlds contract service fails', async () => {
		daoWorldsContractService.fetchDacGlobals.mockResolvedValueOnce(
			Result.withFailure(Failure.fromError(null))
		);

		const result = await useCase.execute('');
		expect(result.isFailure).toBeTruthy();
	});

	it('should return an array of DacGlobals', async () => {
		daoWorldsContractService.fetchDacGlobals.mockResolvedValueOnce(
			Result.withContent([
				<DaoWorldsContract.Deltas.Types.DacGlobalStruct>{
					supply: '1660485.1217 EYE',
					maxSupply: '10000000000.0000 EYE',
					issuer: 'federation',
					transferLocked: false,
				},
			])
		);

		const result = await useCase.execute('');
		expect(result.content).toBeInstanceOf(Array);
		expect(result.content[0]).toBeInstanceOf(
			DaoWorldsContract.Deltas.Entities.DacGlobals
		);
	});

	/*unit-tests*/
});
