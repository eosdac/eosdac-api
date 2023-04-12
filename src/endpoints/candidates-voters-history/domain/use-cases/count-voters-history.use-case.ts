import { inject, injectable, Result, UseCase } from '@alien-worlds/api-core';
import { CandidatesVotersHistoryInput } from '../models/candidates-voters-history.input';
import { CountVotersHistoryQueryModel } from '../models/count-voters-history.query-model';
import { DaoWorldsActionRepository } from '@alien-worlds/dao-api-common/build/contracts/dao-worlds/actions/domain/repositories';

/*imports*/
/**
 * @class
 */
@injectable()
export class CountVotersHistoryUseCase implements UseCase<number> {
  public static Token = 'COUNT_VOTERS_HISTORY_USE_CASE';

  constructor(
    /*injections*/
    @inject(DaoWorldsActionRepository.Token)
    private daoWorldsActionRepository: DaoWorldsActionRepository
  ) {}

  /**
   * @async
   * @returns {Promise<Result<Number, Error>>}
   */
  public async execute(
    input: CandidatesVotersHistoryInput
  ): Promise<Result<number, Error>> {
    const queryModel = CountVotersHistoryQueryModel.create(input);

    const allMatchingActionsRes = await this.daoWorldsActionRepository.count(
      queryModel
    );
    if (allMatchingActionsRes.isFailure) {
      return Result.withFailure(allMatchingActionsRes.failure);
    }

    return Result.withContent(allMatchingActionsRes.content || 0);
  }

  /*methods*/
}
