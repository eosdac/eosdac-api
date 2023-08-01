import { inject, injectable } from '@alien-worlds/aw-core';

import { GetUserVotingHistoryUseCase } from './use-cases/get-user-voting-history.use-case';
import { VotingHistoryInput } from './models/voting-history.input';
import { VotingHistoryOutput } from './models/voting-history.output';

/**
 * Represents the controller for handling voting history-related requests.
 *
 * @class
 * @implements {VotingHistoryController}
 */
@injectable()
export class VotingHistoryController {
  public static Token = 'VOTING_HISTORY_CONTROLLER';

  /**
   * Creates a new instance of VotingHistoryController.
   *
   * @constructor
   * @param {GetUserVotingHistoryUseCase} getUserVotingHistoryUseCase - The use case for retrieving user voting history.
   */
  constructor(
    @inject(GetUserVotingHistoryUseCase.Token)
    private getUserVotingHistoryUseCase: GetUserVotingHistoryUseCase
  ) {}

  /**
   * Handles the votingHistory request and retrieves the user's voting history.
   *
   * @async
   * @method
   * @param {VotingHistoryInput} input - The input data for retrieving voting history.
   * @returns {Promise<VotingHistoryOutput>} A Promise that resolves to the VotingHistoryOutput containing the user's voting history.
   */
  public async votingHistory(
    input: VotingHistoryInput
  ): Promise<VotingHistoryOutput> {
    const result = await this.getUserVotingHistoryUseCase.execute(input);

    return VotingHistoryOutput.create(result);
  }
}
