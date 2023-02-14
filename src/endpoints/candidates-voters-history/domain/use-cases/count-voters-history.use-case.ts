import { inject, injectable, Result, UseCase } from '@alien-worlds/api-core';

import { CandidatesVotersHistoryInput } from '../models/candidates-voters-history.input';
import { ContractActionRepository } from '@alien-worlds/eosdac-api-common';
import { CountVotersHistoryQueryModel } from '../models/count-voters-history.query-model';

/*imports*/
/**
 * @class
 */
@injectable()
export class CountVotersHistoryUseCase implements UseCase<number> {
  public static Token = 'COUNT_VOTERS_HISTORY_USE_CASE';

  constructor(/*injections*/
    @inject(ContractActionRepository.Token)
    private contractActionRepository: ContractActionRepository
  ) { }

  /**
   * @async
   * @returns {Promise<Result<Number, Error>>}
   */
  public async execute(input: CandidatesVotersHistoryInput): Promise<Result<number, Error>> {
    const queryModel = CountVotersHistoryQueryModel.create(input);

    const allMatchingActionsRes = await this.contractActionRepository.count(queryModel);
    if (allMatchingActionsRes.isFailure) {
      return Result.withFailure(allMatchingActionsRes.failure);
    }

    return Result.withContent(allMatchingActionsRes.content || 0)
  }

  /*methods*/
}

