import * as TokenWorldsContract from '@alien-worlds/aw-contract-token-worlds';

import { Container, Failure, Result } from '@alien-worlds/aw-core';

import { GetMembersAgreedTermsUseCase } from '../get-members-agreed-terms.use-case';

let container: Container;
let useCase: GetMembersAgreedTermsUseCase;
const tokenWorldsContractService = {
  fetchMembers: jest.fn(),
};

describe('GetMembersAgreedTermsUseCase', () => {
  beforeAll(() => {
    container = new Container();

    container
      .bind<TokenWorldsContract.Services.TokenWorldsContractService>(
        TokenWorldsContract.Services.TokenWorldsContractService.Token
      )
      .toConstantValue(tokenWorldsContractService as any);

    container
      .bind<GetMembersAgreedTermsUseCase>(GetMembersAgreedTermsUseCase.Token)
      .to(GetMembersAgreedTermsUseCase);
  });

  beforeEach(() => {
    useCase = container.get<GetMembersAgreedTermsUseCase>(
      GetMembersAgreedTermsUseCase.Token
    );
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(GetMembersAgreedTermsUseCase.Token).not.toBeNull();
  });

  it('should return a map of accounts and agreed terms version', async () => {
    const dacId = 'daccustodian';
    const accounts = ['account1', 'account2'];

    tokenWorldsContractService.fetchMembers.mockResolvedValue(
      Result.withContent([
        { sender: accounts[0], agreedtermsversion: 5 },
        { sender: accounts[1], agreedtermsversion: 4 },
      ])
    );

    const result = await useCase.execute(dacId, accounts);

    expect(result.content).toEqual(
      new Map([
        [accounts[0], 5],
        [accounts[1], 4],
      ])
    );
  });

  it('should return default version of agreed terms version if service does not specify', async () => {
    const dacId = 'daccustodian';
    const accounts = ['account1'];

    tokenWorldsContractService.fetchMembers.mockResolvedValue(
      Result.withContent([{ sender: accounts[0] }])
    );

    const result = await useCase.execute(dacId, accounts);

    expect(result.content).toEqual(new Map([[accounts[0], 1]]));
  });

  it('should return a failure if fetching members fails', async () => {
    const dacId = 'daccustodian';
    const accounts = ['account1', 'account2'];

    tokenWorldsContractService.fetchMembers.mockResolvedValue(
      Result.withFailure(Failure.withMessage('error'))
    );

    const result = await useCase.execute(dacId, accounts);

    expect(result.failure).toBeTruthy();
  });
});
