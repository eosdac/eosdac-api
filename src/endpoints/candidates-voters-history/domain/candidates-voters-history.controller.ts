import { inject, injectable } from '@alien-worlds/aw-core';

import { CandidatesVotersHistoryInput } from './models/candidates-voters-history.input';
import { CountVotersHistoryUseCase } from './use-cases/count-voters-history.use-case';
import { GetCandidatesVotersHistoryUseCase } from './use-cases/get-candidates-voters-history.use-case';
import { CandidatesVotersHistoryOutput } from './models/candidates-voters-history.output';
import { AssignVotingPowerUseCase } from './use-cases/assign-voting-power.use-case';

/**
 * @class
 */
@injectable()
export class CandidatesVotersHistoryController {
  public static Token = 'VOTERS_HISTORY_CONTROLLER';

  constructor(
    @inject(GetCandidatesVotersHistoryUseCase.Token)
    private getCandidatesVotersHistoryUseCase: GetCandidatesVotersHistoryUseCase,

    @inject(AssignVotingPowerUseCase.Token)
    private assignVotingPowerUseCase: AssignVotingPowerUseCase,

    @inject(CountVotersHistoryUseCase.Token)
    private countVotersHistoryUseCase: CountVotersHistoryUseCase
  ) {}

  /**
   *
   * @returns {Promise<CandidatesVotersHistoryOutput>}
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
