/* eslint-disable @typescript-eslint/no-explicit-any */

import * as TokenWorldsContract from '@alien-worlds/token-worlds-common';

import { Container, Failure, Result } from '@alien-worlds/api-core';

import { GetMemberTermsUseCase } from '../get-member-terms.use-case';

describe('GetMemberTermsUseCase', () => {
  let container: Container;
  let useCase: GetMemberTermsUseCase;

  const mockService = {
    fetchMemberTerms: jest.fn(),
  };

  beforeAll(() => {
    container = new Container();
    container
      .bind<GetMemberTermsUseCase>(GetMemberTermsUseCase.Token)
      .toConstantValue(new GetMemberTermsUseCase(mockService as any));
  });

  beforeEach(() => {
    useCase = container.get<GetMemberTermsUseCase>(GetMemberTermsUseCase.Token);
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('should return a Member Terms object', async () => {
    mockService.fetchMemberTerms.mockResolvedValue(
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

  it('should return a failure if the service fails', async () => {
    mockService.fetchMemberTerms.mockResolvedValue(
      Result.withFailure(Failure.withMessage('error'))
    );
    const result = await useCase.execute('dac');

    expect(result.failure).toBeInstanceOf(Failure);
  });
});
