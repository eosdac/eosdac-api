import { Failure, Result } from '@alien-worlds/api-core';
import { Stat, TokenWorldsContractService, TokenWorldsStatTableRow } from '@alien-worlds/eosdac-api-common';
import { Container } from 'inversify';

import { GetDacTokensUseCase } from '../get-dac-tokens.use-case';

import 'reflect-metadata';

/*imports*/
/*mocks*/

const tokenWorldsContractService = {
  fetchStats: jest.fn(),
};

let container: Container;
let useCase: GetDacTokensUseCase;

describe('Get Dac Tokens Unit tests', () => {
  beforeAll(() => {
    container = new Container();

    container
      .bind<TokenWorldsContractService>(TokenWorldsContractService.Token)
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
    tokenWorldsContractService.fetchStats.mockResolvedValueOnce(Result.withFailure(Failure.fromError(null)))

    const result = await useCase.execute('');
    expect(result.isFailure).toBeTruthy();
  });

  it('should return an array of Stat', async () => {
    tokenWorldsContractService.fetchStats.mockResolvedValueOnce(Result.withContent([<TokenWorldsStatTableRow>{
      supply: "1660485.1217 EYE",
      maxSupply: "10000000000.0000 EYE",
      issuer: "federation",
      transferLocked: false
    }]))

    const result = await useCase.execute('EYE');
    expect(result.content).toBeInstanceOf(Array);
    expect(result.content[0]).toBeInstanceOf(Stat);
  });

  /*unit-tests*/
});

