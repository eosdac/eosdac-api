import * as TokenWorldsContract from '@alien-worlds/token-worlds-common';

import { anything, instance, mock, verify, when } from 'ts-mockito';

import { Failure } from '@alien-worlds/api-core';
import { GetMembersAgreedTermsUseCase } from '../get-members-agreed-terms.use-case';

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('GetMembersAgreedTermsUseCase', () => {
  let getMembersAgreedTermsUseCase: GetMembersAgreedTermsUseCase;
  let tokenWorldsContractService: TokenWorldsContract.Services.TokenWorldsContractService;

  beforeEach(() => {
    tokenWorldsContractService = mock(
      TokenWorldsContract.Services.TokenWorldsContractService
    );
    getMembersAgreedTermsUseCase = new GetMembersAgreedTermsUseCase(
      instance(tokenWorldsContractService)
    );
  });

  it('should return a map of accounts and agreed terms version', async () => {
    const dacId = 'daccustodian';
    const accounts = ['account1', 'account2'];

    const rows = [
      { sender: 'account1', agreedtermsversion: 2 },
      { sender: 'account2', agreedtermsversion: 3 },
    ];

    when(tokenWorldsContractService.fetchMembers(anything())).thenResolve({
      content: rows,
    } as any);

    const result = await getMembersAgreedTermsUseCase.execute(dacId, accounts);

    expect(result.content).toEqual(
      new Map([
        ['account1', 2],
        ['account2', 3],
      ])
    );

    verify(tokenWorldsContractService.fetchMembers(anything())).once();
  });

  it('should return a failure if fetching members fails', async () => {
    const dacId = 'daccustodian';
    const accounts = ['account1', 'account2'];

    when(tokenWorldsContractService.fetchMembers(anything())).thenResolve({
      failure: Failure.withMessage('error'),
    } as any);

    const result = await getMembersAgreedTermsUseCase.execute(dacId, accounts);

    expect(result.failure).toBeTruthy();

    verify(tokenWorldsContractService.fetchMembers(anything())).once();
  });
});
