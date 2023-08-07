import * as DaoWorldsCommon from '@alien-worlds/aw-contract-dao-worlds';
import { inject, injectable, Result, UseCase } from '@alien-worlds/aw-core';

import { CandidatesVotersHistoryInput } from '../models/candidates-voters-history.input';
import { CountVotersHistoryQueryBuilder } from '../models/count-voters-history.query-builder';

/**
 * Represents the use case for counting voters' history for a candidate.
 * @class
 * @implements {UseCase<number>}
 */
@injectable()
export class CountVotersHistoryUseCase implements UseCase<number> {
  public static Token = 'COUNT_VOTERS_HISTORY_USE_CASE';

  /**
   * Creates a new instance of CountVotersHistoryUseCase.
   *
   * @constructor
   * @param {DaoWorldsCommon.Actions.DaoWorldsActionRepository} daoWorldsActionRepository - The repository for DAO worlds actions.
   */
  constructor(
    @inject(DaoWorldsCommon.Actions.DaoWorldsActionRepository.Token)
    private daoWorldsActionRepository: DaoWorldsCommon.Actions.DaoWorldsActionRepository
  ) {}

  /**
   * Executes the CountVotersHistoryUseCase with the provided input.
   *
   * @async
   * @public
   * @param {CandidatesVotersHistoryInput} input - The input containing the DAC ID and candidate ID.
   * @returns {Promise<Result<number, Error>>} - A promise that resolves with a Result containing the count of voters' history for the candidate.
   */
  public async execute(
    input: CandidatesVotersHistoryInput
  ): Promise<Result<number, Error>> {
    const builder = new CountVotersHistoryQueryBuilder().with({ ...input });
    const allMatchingActionsRes = await this.daoWorldsActionRepository.count(
      builder
    );

    if (allMatchingActionsRes.isFailure) {
      return Result.withFailure(allMatchingActionsRes.failure);
    }

    return Result.withContent(allMatchingActionsRes.content || 0);
  }
}
