import { inject, injectable, Result, UseCase } from '@alien-worlds/api-core';
import {
  UserVote,
  UserVotingHistoryRepository,
} from '@alien-worlds/dao-api-common';
import { VotingHistoryInput } from '../models/voting-history.input';
import { VotingHistoryQueryModel } from '@alien-worlds/dao-api-common';

/*imports*/
/**
 * @class
 */
@injectable()
export class GetUserVotingHistoryUseCase implements UseCase<UserVote[]> {
  public static Token = 'GET_USER_VOTING_HISTORY_USE_CASE';

  constructor(
    /*injections*/
    @inject(UserVotingHistoryRepository.Token)
    private userVotingHistoryRepository: UserVotingHistoryRepository
  ) {}

  /**
   * @async
   * @returns {Promise<Result<UserVote[]>>}
   */
  public async execute(input: VotingHistoryInput): Promise<Result<UserVote[]>> {
    const { dacId, voter, skip, limit } = input;
    const model = VotingHistoryQueryModel.create(dacId, voter, skip, limit);

    const { content: votingHistory, failure: findVotingHistoryFailure } =
      await this.userVotingHistoryRepository.find(model);

    if (findVotingHistoryFailure) {
      return Result.withFailure(findVotingHistoryFailure);
    }

    return Result.withContent(votingHistory);
  }

  /*methods*/
}
