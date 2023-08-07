import { inject, injectable } from '@alien-worlds/aw-core';

import { CandidatesVotersHistoryInput } from './models/candidates-voters-history.input';
import { CountVotersHistoryUseCase } from './use-cases/count-voters-history.use-case';
import { GetCandidatesVotersHistoryUseCase } from './use-cases/get-candidates-voters-history.use-case';
import { CandidatesVotersHistoryOutput } from './models/candidates-voters-history.output';
import { AssignVotingPowerUseCase } from './use-cases/assign-voting-power.use-case';

/**
 * Represents the controller for managing candidates' voting history.
 * @class
 */
@injectable()
export class CandidatesVotersHistoryController {
  public static Token = 'VOTERS_HISTORY_CONTROLLER';

  /**
   * Creates a new instance of CandidatesVotersHistoryController.
   *
   * @constructor
   * @param {GetCandidatesVotersHistoryUseCase} getCandidatesVotersHistoryUseCase - The use case for getting candidates' voting history.
   * @param {AssignVotingPowerUseCase} assignVotingPowerUseCase - The use case for assigning voting power to the voting history.
   * @param {CountVotersHistoryUseCase} countVotersHistoryUseCase - The use case for counting voters' history.
   */
  constructor(
    @inject(GetCandidatesVotersHistoryUseCase.Token)
    private getCandidatesVotersHistoryUseCase: GetCandidatesVotersHistoryUseCase,

    @inject(AssignVotingPowerUseCase.Token)
    private assignVotingPowerUseCase: AssignVotingPowerUseCase,

    @inject(CountVotersHistoryUseCase.Token)
    private countVotersHistoryUseCase: CountVotersHistoryUseCase
  ) {}

  /**
   * Retrieves the candidates' voting history based on the provided input.
   *
   * @async
   * @public
   * @param {CandidatesVotersHistoryInput} input - The input containing the DAC ID, candidate ID, skip, and limit.
   * @returns {Promise<CandidatesVotersHistoryOutput>} - A promise that resolves with the candidates' voting history output.
   */
  public async candidatesVotersHistory(
    input: CandidatesVotersHistoryInput
  ): Promise<CandidatesVotersHistoryOutput> {
    // Fetch voters history
    const { content: votes, failure: getVotesFailure } =
      await this.getCandidatesVotersHistoryUseCase.execute(input);

    if (getVotesFailure) {
      return CandidatesVotersHistoryOutput.create([], 0, getVotesFailure);
    }

    const { content: results } = await this.assignVotingPowerUseCase.execute(
      votes
    );

    // Fetch total count
    const { content: total, failure: countFailure } =
      await this.countVotersHistoryUseCase.execute(input);

    if (countFailure) {
      return CandidatesVotersHistoryOutput.create([], 0, countFailure);
    }

    return CandidatesVotersHistoryOutput.create(results, total);
  }
}
