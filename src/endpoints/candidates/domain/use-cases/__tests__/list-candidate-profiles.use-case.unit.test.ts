import 'reflect-metadata';

import * as DaoWorldsCommon from '@alien-worlds/aw-contract-dao-worlds';
import * as IndexWorldsContract from '@alien-worlds/aw-contract-index-worlds';

import { Container, Failure, Result } from '@alien-worlds/aw-core';

import { DacMapper } from '@endpoints/dacs/data/mappers/dacs.mapper';
import { GetCandidatesUseCase } from '../get-candidates.use-case';
import { GetMembersAgreedTermsUseCase } from '../get-members-agreed-terms.use-case';
import { GetMemberTermsUseCase } from '../get-member-terms.use-case';
import { GetProfilesUseCase } from '../../../../profile/domain/use-cases/get-profiles.use-case';
import { ListCandidateProfilesUseCase } from '../list-candidate-profiles.use-case';
import { Pair } from '@alien-worlds/aw-antelope';

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

const getMembersAgreedTermsUseCase = {
  execute: jest.fn(),
};

const dacConfig = new DacMapper().toDac(
  new IndexWorldsContract.Deltas.Mappers.DacsRawMapper().toEntity(<
    IndexWorldsContract.Deltas.Types.DacsRawModel
  >{
    accounts: [{ key: '2', value: 'dao.worlds' }] as Pair[],
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
    getCandidatesUseCase.execute.mockResolvedValue(
      Result.withContent([
        DaoWorldsCommon.Deltas.Entities.Candidates.getDefault(),
      ])
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
    await useCase.execute('dacId', dacConfig);
    expect(getCandidatesUseCase.execute).toBeCalled();
  });

  it('Should return failure when GetCandidatesUseCase fails', async () => {
    getCandidatesUseCase.execute.mockResolvedValue(
      Result.withFailure(Failure.withMessage('error'))
    );

    const result = await useCase.execute('dacId', dacConfig);
    expect(result.failure).toBeTruthy();
  });

  it('Should execute GetProfilesUseCase', async () => {
    await useCase.execute('dacId', dacConfig);
    expect(getProfilesUseCase.execute).toBeCalled();
  });

  it('Should return failure when GetProfilesUseCase fails', async () => {
    getProfilesUseCase.execute.mockResolvedValue(
      Result.withFailure(Failure.withMessage('error'))
    );

    const result = await useCase.execute('dacId', dacConfig);
    expect(result.failure).toBeTruthy();
  });

  it('Should execute GetMemberTermsUseCase', async () => {
    await useCase.execute('dacId', dacConfig);
    expect(getMemberTermsUseCase.execute).toBeCalled();
  });

  it('Should return failure when GetMemberTermsUseCase fails', async () => {
    getMemberTermsUseCase.execute.mockResolvedValue(
      Result.withFailure(Failure.withMessage('error'))
    );

    const result = await useCase.execute('dacId', dacConfig);
    expect(result.failure).toBeTruthy();
  });

  it('Should execute GetMembersAgreedTermsUseCase', async () => {
    await useCase.execute('dacId', dacConfig);
    expect(getMembersAgreedTermsUseCase.execute).toBeCalled();
  });

  it('Should return failure when GetMembersAgreedTermsUseCase fails', async () => {
    getMembersAgreedTermsUseCase.execute.mockResolvedValue(
      Result.withFailure(Failure.withMessage('error'))
    );

    const result = await useCase.execute('dacId', dacConfig);
    expect(result.failure).toBeTruthy();
  });
});
