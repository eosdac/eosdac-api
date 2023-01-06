import 'reflect-metadata';

import { Failure, Result } from '@alien-worlds/api-core';

import { Container } from 'inversify';
import { GetUserVotingHistoryUseCase } from '../get-user-voting-history.use-case';
import { UserVote } from '../../entities/user-vote';
import { UserVotingHistoryRepository } from '../../repositories/user-voting-history.repository';
import { VoteAction } from '../../../data/dtos/user-voting-history.dto';
import { VotingHistoryInput } from '../../models/voting-history.input';

/*imports*/
/*mocks*/

const userVotingHistoryRepository = {
  find: jest.fn(),
};

let container: Container;
let useCase: GetUserVotingHistoryUseCase;
const input: VotingHistoryInput = VotingHistoryInput.fromRequest({
  dacId: 'string',
  voter: 'string',
  skip: 0,
  limit: 20,
})

const userVote: UserVote = UserVote.create('id', 'dacId', 'voter', new Date(), 'cand', 0, VoteAction.Voted)

describe('Get User Voting History Unit tests', () => {
  beforeAll(() => {
    container = new Container();

    container
      .bind<UserVotingHistoryRepository>(UserVotingHistoryRepository.Token)
      .toConstantValue(userVotingHistoryRepository as any);
    container
      .bind<GetUserVotingHistoryUseCase>(GetUserVotingHistoryUseCase.Token)
      .to(GetUserVotingHistoryUseCase);
  });

  beforeEach(() => {
    useCase = container.get<GetUserVotingHistoryUseCase>(GetUserVotingHistoryUseCase.Token);
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(GetUserVotingHistoryUseCase.Token).not.toBeNull();
  });

  it('Should return a failure when ...', async () => {
    userVotingHistoryRepository.find.mockResolvedValue(Result.withFailure(Failure.fromError("error")))
    const result = await useCase.execute(input);
    expect(result.isFailure).toBeTruthy();
  });

  it('should return UserVote', async () => {
    userVotingHistoryRepository.find.mockResolvedValue(Result.withContent(userVote))
    const result = await useCase.execute(input);
    expect(result.content).toBeInstanceOf(UserVote);
  });

  /*unit-tests*/
});

