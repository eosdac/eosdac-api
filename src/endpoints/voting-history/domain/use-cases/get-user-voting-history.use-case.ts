import { Result, UseCase } from '@alien-worlds/api-core';
import { inject, injectable } from 'inversify';

import { UserVote } from '../entities/user-vote';
import { VotingHistoryInput } from '../models/voting-history.input';
import { VotingHistoryQueryModel } from '../models/voting-history.query-model';
import { UserVotingHistoryRepository } from '../repositories/user-voting-history.repository';

/*imports*/
/**
 * @class
 */
@injectable()
export class GetUserVotingHistoryUseCase implements UseCase<UserVote[]> {
  public static Token = 'GET_USER_VOTING_HISTORY_USE_CASE';

  constructor(/*injections*/
    @inject(UserVotingHistoryRepository.Token)
    private userVotingHistoryRepository: UserVotingHistoryRepository
  ) { }

  /**
   * @async
   * @returns {Promise<Result<UserVote[]>>}
   */
  public async execute(input: VotingHistoryInput): Promise<Result<UserVote[]>> {
    const model = VotingHistoryQueryModel.create(input);

    const { content: votingHistory, failure: findVotingHistoryFailure } =
      await this.userVotingHistoryRepository.find(model);

    if (findVotingHistoryFailure) {
      return Result.withFailure(findVotingHistoryFailure);
    }

    return Result.withContent(votingHistory)
  }

  /*methods*/
}

