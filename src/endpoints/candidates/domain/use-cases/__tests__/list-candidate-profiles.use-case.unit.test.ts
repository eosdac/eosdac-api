import { Container, Failure, Result } from '@alien-worlds/api-core';
import * as IndexWorldsContract from '@alien-worlds/index-worlds-common';
import { DacMapper } from '@endpoints/get-dacs/data/mappers/dacs.mapper';

import { GetProfilesUseCase } from '../../../../profile/domain/use-cases/get-profiles.use-case';
import { GetCandidatesUseCase } from '../get-candidates.use-case';
import { GetMemberTermsUseCase } from '../get-member-terms.use-case';
import { GetMembersAgreedTermsUseCase } from '../get-members-agreed-terms.use-case';
import { GetVotedCandidateIdsUseCase } from '../get-voted-candidate-ids.use-case';
import { ListCandidateProfilesUseCase } from '../list-candidate-profiles.use-case';

import 'reflect-metadata';

/*mocks*/

let container: Container;
let useCase: ListCandidateProfilesUseCase;

const getCandidatesUseCase = {
  execute: jest.fn(),
};
const getProfilesUseCase = {
  execute: jest.fn(),
};
const getMemberTermsUseCase = {
  execute: jest.fn(),
};
const getVotedCandidateIdsUseCase = {
  execute: jest.fn(),
};
const getMembersAgreedTermsUseCase = {
  execute: jest.fn(),
};

const dacConfig = new DacMapper().toDac(
  new IndexWorldsContract.Deltas.Mappers.DacsRawMapper().toEntity(<
    IndexWorldsContract.Deltas.Types.DacsRawModel
  >{
    accounts: [{ key: 2, value: 'dao.worlds' }],
    sym: {
      symbol: 'EYE',
    },
    refs: [],
  })
);

describe('ListCandidateProfilesUseCase Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    /*bindings*/
    container
      .bind<GetCandidatesUseCase>(GetCandidatesUseCase.Token)
      .toConstantValue(getCandidatesUseCase as any);
    container
      .bind<GetProfilesUseCase>(GetProfilesUseCase.Token)
      .toConstantValue(getProfilesUseCase as any);
    container
      .bind<GetMemberTermsUseCase>(GetMemberTermsUseCase.Token)
      .toConstantValue(getMemberTermsUseCase as any);
    container
      .bind<GetVotedCandidateIdsUseCase>(GetVotedCandidateIdsUseCase.Token)
      .toConstantValue(getVotedCandidateIdsUseCase as any);
    container
      .bind<GetMembersAgreedTermsUseCase>(GetMembersAgreedTermsUseCase.Token)
      .toConstantValue(getMembersAgreedTermsUseCase as any);
    container
      .bind<ListCandidateProfilesUseCase>(ListCandidateProfilesUseCase.Token)
      .to(ListCandidateProfilesUseCase);
  });

  beforeEach(() => {
    useCase = container.get<ListCandidateProfilesUseCase>(
      ListCandidateProfilesUseCase.Token
    );
    getCandidatesUseCase.execute.mockResolvedValue(Result.withContent([]));
    getVotedCandidateIdsUseCase.execute.mockResolvedValue(
      Result.withContent([])
    );
    getProfilesUseCase.execute.mockResolvedValue(Result.withContent([]));
    getMemberTermsUseCase.execute.mockResolvedValue(Result.withContent({}));
    getMembersAgreedTermsUseCase.execute.mockResolvedValue(
      Result.withContent(new Map())
    );
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(ListCandidateProfilesUseCase.Token).not.toBeNull();
  });

  it('Should execute GetCandidatesUseCase', async () => {
    await useCase.execute('dacId', 'walletId', dacConfig);
    expect(getCandidatesUseCase.execute).toBeCalled();
  });

  it('Should return failure when GetCandidatesUseCase fails', async () => {
    getCandidatesUseCase.execute.mockResolvedValue(
      Result.withFailure(Failure.withMessage('error'))
    );

    const result = await useCase.execute('dacId', 'walletId', dacConfig);
    expect(result.failure).toBeTruthy();
  });

  it('Should execute GetVotedCandidateIdsUseCase', async () => {
    await useCase.execute('dacId', 'walletId', dacConfig);
    expect(getVotedCandidateIdsUseCase.execute).toBeCalled();
  });

  it('Should return failure when GetVotedCandidateIdsUseCase fails', async () => {
    getVotedCandidateIdsUseCase.execute.mockResolvedValue(
      Result.withFailure(Failure.withMessage('error'))
    );

    const result = await useCase.execute('dacId', 'walletId', dacConfig);
    expect(result.failure).toBeTruthy();
  });

  it('Should execute GetProfilesUseCase', async () => {
    await useCase.execute('dacId', 'walletId', dacConfig);
    expect(getProfilesUseCase.execute).toBeCalled();
  });

  it('Should return failure when GetProfilesUseCase fails', async () => {
    getProfilesUseCase.execute.mockResolvedValue(
      Result.withFailure(Failure.withMessage('error'))
    );

    const result = await useCase.execute('dacId', 'walletId', dacConfig);
    expect(result.failure).toBeTruthy();
  });

  it('Should execute GetMemberTermsUseCase', async () => {
    await useCase.execute('dacId', 'walletId', dacConfig);
    expect(getMemberTermsUseCase.execute).toBeCalled();
  });

  it('Should return failure when GetMemberTermsUseCase fails', async () => {
    getMemberTermsUseCase.execute.mockResolvedValue(
      Result.withFailure(Failure.withMessage('error'))
    );

    const result = await useCase.execute('dacId', 'walletId', dacConfig);
    expect(result.failure).toBeTruthy();
  });

  it('Should execute GetMembersAgreedTermsUseCase', async () => {
    await useCase.execute('dacId', 'walletId', dacConfig);
    expect(getMembersAgreedTermsUseCase.execute).toBeCalled();
  });

  it('Should return failure when GetMembersAgreedTermsUseCase fails', async () => {
    getMembersAgreedTermsUseCase.execute.mockResolvedValue(
      Result.withFailure(Failure.withMessage('error'))
    );

    const result = await useCase.execute('dacId', 'walletId', dacConfig);
    expect(result.failure).toBeTruthy();
  });
});
