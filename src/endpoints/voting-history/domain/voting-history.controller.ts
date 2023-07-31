import { inject, injectable } from '@alien-worlds/aw-core';

import { GetUserVotingHistoryUseCase } from './use-cases/get-user-voting-history.use-case';
import { VotingHistoryInput } from './models/voting-history.input';
import { VotingHistoryOutput } from './models/voting-history.output';

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
   * @returns {Promise<VotingHistoryOutput>}
   */
  public async votingHistory(
    input: VotingHistoryInput
  ): Promise<VotingHistoryOutput> {
    const result = await this.getUserVotingHistoryUseCase.execute(input);

    return VotingHistoryOutput.create(result);
  }
}
