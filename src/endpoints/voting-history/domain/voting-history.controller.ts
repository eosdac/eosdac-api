import { inject, injectable, Result } from '@alien-worlds/aw-core';

import { GetUserVotingHistoryUseCase } from './use-cases/get-user-voting-history.use-case';
import { UserVote } from '../domain/entities/user-vote';
import { VotingHistoryInput } from './models/voting-history.input';

/**
 * @class
 *
 *
 */
@injectable()
export class VotingHistoryController {
  public static Token = 'VOTING_HISTORY_CONTROLLER';

  constructor(
    @inject(GetUserVotingHistoryUseCase.Token)
    private getUserVotingHistoryUseCase: GetUserVotingHistoryUseCase
  ) {}

  /**
   *
   * @returns {Promise<Result<UserVote[], Error>>}
   */
  public async votingHistory(
    input: VotingHistoryInput
  ): Promise<Result<UserVote[], Error>> {
    return await this.getUserVotingHistoryUseCase.execute(input);
  }
}
