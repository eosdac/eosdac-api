import * as TokenWorldsContract from '@alien-worlds/aw-contract-token-worlds';

import { Container, Failure, Result } from '@alien-worlds/aw-core';

import { GetMemberTermsUseCase } from '../get-member-terms.use-case';

describe('GetMemberTermsUseCase', () => {
  let container: Container;
  let useCase: GetMemberTermsUseCase;

  const mockService = {
    fetchMemberterms: jest.fn(),
  };

  beforeAll(() => {
    container = new Container();
    container
      .bind<TokenWorldsContract.Services.TokenWorldsContractService>(
        TokenWorldsContract.Services.TokenWorldsContractService.Token
      )
      .toConstantValue(mockService as any);

    container
      .bind<GetMemberTermsUseCase>(GetMemberTermsUseCase.Token)
      .to(GetMemberTermsUseCase);
  });

  beforeEach(() => {
    useCase = container.get<GetMemberTermsUseCase>(GetMemberTermsUseCase.Token);
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(GetMemberTermsUseCase.Token).not.toBeNull();
  });

  it('should return a Member Terms object', async () => {
    mockService.fetchMemberterms.mockResolvedValue(
      Result.withContent([
        {
          version: 1,
          terms: '1',
          hash: '10539818110539828',
          dac_id: 'sample.dac',
        },
      ])
    );
    const result = await useCase.execute('dac');

    expect(result.content).toBeInstanceOf(
      TokenWorldsContract.Deltas.Entities.Memberterms
    );
  });

  it('should return null if service returns empty array', async () => {
    mockService.fetchMemberterms.mockResolvedValue(Result.withContent([]));
    const result = await useCase.execute('dac');

    expect(result.content).toBeNull;
  });

  it('should return a failure if the service fails', async () => {
    mockService.fetchMemberterms.mockResolvedValue(
      Result.withFailure(Failure.withMessage('error'))
    );
    const result = await useCase.execute('dac');

    expect(result.failure).toBeInstanceOf(Failure);
  });
});
