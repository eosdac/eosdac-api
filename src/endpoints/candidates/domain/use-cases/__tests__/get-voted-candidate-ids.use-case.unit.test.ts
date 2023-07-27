import * as DaoWorldsCommon from '@alien-worlds/aw-contract-dao-worlds';

import { Container, Failure, Result } from '@alien-worlds/aw-core';

import { GetVotedCandidateIdsUseCase } from '../get-voted-candidate-ids.use-case';

let container: Container;
let useCase: GetVotedCandidateIdsUseCase;

const daoWorldsContractService = {
  fetchVotes: jest.fn(),
};

describe('GetVotedCandidateIdsUseCase', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<DaoWorldsCommon.Services.DaoWorldsContractService>(
        DaoWorldsCommon.Services.DaoWorldsContractService.Token
      )
      .toConstantValue(daoWorldsContractService as any);

    container
      .bind<GetVotedCandidateIdsUseCase>(GetVotedCandidateIdsUseCase.Token)
      .to(GetVotedCandidateIdsUseCase);
  });

  beforeEach(() => {
    useCase = container.get<GetVotedCandidateIdsUseCase>(
      GetVotedCandidateIdsUseCase.Token
    );
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('should return a list of candidates', async () => {
    const dacId = 'dacid';
    const walletId = 'somewalletid';

    daoWorldsContractService.fetchVotes.mockResolvedValue(
      Result.withContent([
        { candidates: ['candidate1', 'candidate2', 'candidate3'] },
      ])
    );

    const result = await useCase.execute(walletId, dacId);

    expect(result.content).toBeInstanceOf(Array);
  });

  it('should return an empty array if no candidates are found', async () => {
    const dacId = 'nonexistentdacid';
    const walletId = 'somewalletid';

    daoWorldsContractService.fetchVotes.mockResolvedValue(
      Result.withContent([{ candidates: [] }])
    );

    const result = await useCase.execute(walletId, dacId);

    expect(result.content).toStrictEqual([]);
  });

  it('should return an empty array if an error occurs', async () => {
    const dacId = 'nonexistentdacid';
    const walletId = 'somewalletid';

    daoWorldsContractService.fetchVotes.mockResolvedValue(
      Result.withFailure(Failure.withMessage('error'))
    );

    const result = await useCase.execute(walletId, dacId);

    expect(result).not.toBeNull();
    expect(result.content).toBeFalsy();
  });
});
