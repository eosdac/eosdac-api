import { Failure, Result } from '@alien-worlds/api-core';
import { TokenWorldsContract } from '@alien-worlds/eosdac-api-common';
import { Container } from 'inversify';

import { GetDacTokensUseCase } from '../get-dac-tokens.use-case';

import 'reflect-metadata';

/*imports*/
/*mocks*/

const tokenWorldsContractService = {
	fetchStat: jest.fn(),
};

let container: Container;
let useCase: GetDacTokensUseCase;

describe('Get Dac Tokens Unit tests', () => {
	beforeAll(() => {
		container = new Container();

		container
			.bind<TokenWorldsContract.Services.TokenWorldsContractService>(
				TokenWorldsContract.Services.TokenWorldsContractService.Token
			)
			.toConstantValue(tokenWorldsContractService as any);
		container
			.bind<GetDacTokensUseCase>(GetDacTokensUseCase.Token)
			.to(GetDacTokensUseCase);
	});

	beforeEach(() => {
		useCase = container.get<GetDacTokensUseCase>(GetDacTokensUseCase.Token);
	});

	afterAll(() => {
		jest.clearAllMocks();
		container = null;
	});

	it('"Token" should be set', () => {
		expect(GetDacTokensUseCase.Token).not.toBeNull();
	});

	it('Should return a failure when token.worlds contract service fails', async () => {
		tokenWorldsContractService.fetchStat.mockResolvedValueOnce(
			Result.withFailure(Failure.fromError(null))
		);

		const result = await useCase.execute('');
		expect(result.isFailure).toBeTruthy();
	});

	it('should return an array of Stat', async () => {
		tokenWorldsContractService.fetchStat.mockResolvedValueOnce(
			Result.withContent([
				<TokenWorldsContract.Deltas.Types.StatStruct>{
					supply: '1660485.1217 EYE',
					max_supply: '10000000000.0000 EYE',
					issuer: 'federation',
					transfer_locked: false,
				},
			])
		);

		const result = await useCase.execute('EYE');
		expect(result.content).toBeInstanceOf(Array);
		expect(result.content[0]).toBeInstanceOf(
			TokenWorldsContract.Deltas.Entities.Stat
		);
	});

	/*unit-tests*/
});
