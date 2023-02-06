import 'reflect-metadata';

import { Failure, Result } from '@alien-worlds/api-core';
import {
	AlienWorldsContract,
	DacDirectory,
	DaoWorldsContract,
	IndexWorldsContract,
	TokenWorldsContract,
} from '@alien-worlds/eosdac-api-common';
import { Container } from 'inversify';

import { GetAllDacsUseCase } from '../use-cases/get-all-dacs.use-case';
import { GetDacInfoUseCase } from '../use-cases/get-dac-info.use-case';
import { GetDacsController } from '../get-dacs.controller';
import { GetDacsInput } from '../models/dacs.input';
import { GetDacTokensUseCase } from '../use-cases/get-dac-tokens.use-case';
import { GetDacTreasuryUseCase } from '../use-cases/get-dac-treasury.use-case';


/*imports*/

/*mocks*/

const getAllDacsUseCase = {
	execute: jest.fn(() =>
		Result.withContent([
			DacDirectory.fromStruct(<IndexWorldsContract.Deltas.Types.DacsStruct>{
				accounts: [
					{ key: 0, value: 'dao.worlds' },
					{ key: 2, value: 'dao.worlds' },
				],
				symbol: { sym: 'EYE' },
				refs: [],
			}),
		])
	),
};
const getDacTreasuryUseCase = {
	execute: jest.fn(() =>
		Result.withContent([
			AlienWorldsContract.Deltas.Entities.Account.fromStruct(<
				AlienWorldsContract.Deltas.Types.AccountsStruct
			>{
				balance: 'string',
			}),
		])
	),
};
const getDacInfoUseCase = {
	execute: jest.fn(() =>
		Result.withContent([
			DaoWorldsContract.Deltas.Entities.DacGlobals.fromStruct({
				data: [
					{
						key: 'auth_threshold_high',
						value: ['uint8', '3'],
					},
				],
			}),
		])
	),
};
const getDacTokensUseCase = {
	execute: jest.fn(() =>
		Result.withContent([
			TokenWorldsContract.Deltas.Entities.Stat.fromStruct({
				supply: '1660485.1217 EYE',
				maxSupply: '10000000000.0000 EYE',
				issuer: 'federation',
				transferLocked: false,
			}),
		])
	),
};

const input: GetDacsInput = {
	dacId: 'string',
	scope: 'string',
	limit: 1,
};

let container: Container;
let controller: GetDacsController;

describe('GetDacs Controller Unit tests', () => {
	beforeAll(() => {
		container = new Container();
		/*bindings*/
		container
			.bind<GetAllDacsUseCase>(GetAllDacsUseCase.Token)
			.toConstantValue(getAllDacsUseCase as any);
		container
			.bind<GetDacTreasuryUseCase>(GetDacTreasuryUseCase.Token)
			.toConstantValue(getDacTreasuryUseCase as any);
		container
			.bind<GetDacInfoUseCase>(GetDacInfoUseCase.Token)
			.toConstantValue(getDacInfoUseCase as any);
		container
			.bind<GetDacTokensUseCase>(GetDacTokensUseCase.Token)
			.toConstantValue(getDacTokensUseCase as any);
		container
			.bind<GetDacsController>(GetDacsController.Token)
			.to(GetDacsController);
	});

	beforeEach(() => {
		controller = container.get<GetDacsController>(GetDacsController.Token);
	});

	afterAll(() => {
		jest.clearAllMocks();
		container = null;
	});

	it('"Token" should be set', () => {
		expect(GetDacsController.Token).not.toBeNull();
	});

	it('Should execute GetAllDacsUseCase', async () => {
		await controller.dacs(input);

		expect(getAllDacsUseCase.execute).toBeCalled();
	});

	it('Should execute GetDacTreasuryUseCase', async () => {
		await controller.dacs(input);

		expect(getDacTreasuryUseCase.execute).toBeCalled();
	});

	it('Should execute GetDacInfoUseCase', async () => {
		await controller.dacs(input);

		expect(getDacInfoUseCase.execute).toBeCalled();
	});

	it('Should execute GetDacTokensUseCase', async () => {
		await controller.dacs(input);

		expect(getDacTokensUseCase.execute).toBeCalled();
	});

	it('Should return failure when GetAllDacsUseCase fails', async () => {
		getAllDacsUseCase.execute.mockImplementationOnce(
			jest.fn(() => Result.withFailure(Failure.fromError(null)))
		);

		const result = await controller.dacs(input);

		expect(result.isFailure).toBeTruthy();
	});

	it('Should return failure when GetDacTreasuryUseCase fails', async () => {
		getDacTreasuryUseCase.execute.mockImplementationOnce(
			jest.fn(() => Result.withFailure(Failure.fromError(null)))
		);

		const result = await controller.dacs(input);

		expect(result.isFailure).toBeTruthy();
	});

	it('Should return failure when GetDacInfoUseCase fails', async () => {
		getDacInfoUseCase.execute.mockImplementationOnce(
			jest.fn(() => Result.withFailure(Failure.fromError(null)))
		);

		const result = await controller.dacs(input);

		expect(result.isFailure).toBeTruthy();
	});

	it('Should return failure when GetDacTokensUseCase fails', async () => {
		getDacTokensUseCase.execute.mockImplementationOnce(
			jest.fn(() => Result.withFailure(Failure.fromError(null)))
		);

		const result = await controller.dacs(input);

		expect(result.isFailure).toBeTruthy();
	});
	/*unit-tests*/
});
