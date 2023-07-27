import * as DaoWorldsCommon from '@alien-worlds/aw-contract-dao-worlds';
import { inject, injectable, Result, UseCase } from '@alien-worlds/aw-core';

import { CandidatesVotersHistoryInput } from '../models/candidates-voters-history.input';
import { CountVotersHistoryQueryBuilder } from '../models/count-voters-history.query-model';

/**
 * @class
 */
@injectable()
export class CountVotersHistoryUseCase implements UseCase<number> {
  public static Token = 'COUNT_VOTERS_HISTORY_USE_CASE';

  constructor(
    @inject(DaoWorldsCommon.Actions.DaoWorldsActionRepository.Token)
    private daoWorldsActionRepository: DaoWorldsCommon.Actions.DaoWorldsActionRepository
  ) {}

  /**
   * @async
   * @returns {Promise<Result<Number, Error>>}
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
