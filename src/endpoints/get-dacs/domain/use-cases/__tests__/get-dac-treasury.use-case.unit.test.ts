import 'reflect-metadata';

import { Container, Failure, Result } from '@alien-worlds/api-core';
import { AlienWorldsContract } from '@alien-worlds/eosdac-api-common';
import { GetDacTreasuryUseCase } from '../get-dac-treasury.use-case';

/*imports*/
/*mocks*/

const alienWorldsContractService = {
	fetchAccount: jest.fn(),
};

let container: Container;
let useCase: GetDacTreasuryUseCase;
const input = 'account';

describe('Get Dac Treasury Unit tests', () => {
	beforeAll(() => {
		container = new Container();

		container
			.bind<AlienWorldsContract.Services.AlienWorldsContractService>(
				AlienWorldsContract.Services.AlienWorldsContractService.Token
			)
			.toConstantValue(alienWorldsContractService as any);
		container
			.bind<GetDacTreasuryUseCase>(GetDacTreasuryUseCase.Token)
			.to(GetDacTreasuryUseCase);
	});

	beforeEach(() => {
		useCase = container.get<GetDacTreasuryUseCase>(GetDacTreasuryUseCase.Token);
	});

	afterAll(() => {
		jest.clearAllMocks();
		container = null;
	});

	it('"Token" should be set', () => {
		expect(GetDacTreasuryUseCase.Token).not.toBeNull();
	});

	it('Should return a failure when alien.worlds contract service fails', async () => {
		alienWorldsContractService.fetchAccount.mockResolvedValueOnce(
			Result.withFailure(Failure.fromError(null))
		);

		const result = await useCase.execute(input);
		expect(result.isFailure).toBeTruthy();
	});

	it('should return AlienWorldsAccount', async () => {
		alienWorldsContractService.fetchAccount.mockResolvedValueOnce(
			Result.withContent([
				<AlienWorldsContract.Deltas.Types.AccountsStruct>{
					balance: '12237582.5498 TLM',
				},
			])
		);

		const result = await useCase.execute(input);
		expect(result.content).toBeInstanceOf(
			AlienWorldsContract.Deltas.Entities.Account
		);
	});

	/*unit-tests*/
});
