import { inject, injectable, Result, UseCase } from '@alien-worlds/api-core';
import { ActionRepository } from '@alien-worlds/eosdac-api-common';
import { CandidatesVotersHistoryInput } from '../models/candidates-voters-history.input';
import { CountVotersHistoryQueryModel } from '../models/count-voters-history.query-model';

/*imports*/
/**
 * @class
 */
@injectable()
export class CountVotersHistoryUseCase implements UseCase<number> {
  public static Token = 'COUNT_VOTERS_HISTORY_USE_CASE';

  constructor(/*injections*/
    @inject(ActionRepository.Token)
    private actionRepository: ActionRepository
  ) { }

  /**
   * @async
   * @returns {Promise<Result<Number, Error>>}
   */
  public async execute(input: CandidatesVotersHistoryInput): Promise<Result<number, Error>> {
    const queryModel = CountVotersHistoryQueryModel.create(input);

    const allMatchingActionsRes = await this.actionRepository.count(queryModel);
    if (allMatchingActionsRes.isFailure) {
      return Result.withFailure(allMatchingActionsRes.failure);
    }

    return Result.withContent(allMatchingActionsRes.content || 0)
  }

  /*methods*/
}

