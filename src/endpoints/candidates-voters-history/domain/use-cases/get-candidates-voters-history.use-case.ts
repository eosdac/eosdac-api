import { inject, injectable, Result, UseCase } from '@alien-worlds/api-core';
import { ActionRepository } from '@alien-worlds/eosdac-api-common';

import { CandidatesVotersHistoryOutputItem } from '../../data/dtos/candidates-voters-history.dto';
import { CandidatesVotersHistoryInput } from '../models/candidates-voters-history.input';
import { CandidatesVotersHistoryQueryModel } from '../models/candidates-voters-history.query-model';

/*imports*/

/**
 * @class
 */
@injectable()
export class GetCandidatesVotersHistoryUseCase implements UseCase<CandidatesVotersHistoryOutputItem[]> {
  public static Token = 'GET_CANDIDATES_VOTERS_HISTORY_USE_CASE';

  constructor(/*injections*/
    @inject(ActionRepository.Token)
    private actionRepository: ActionRepository
  ) { }

  /**
   * @async
   * @returns {Promise<Result<CandidatesVotersHistoryOutputItem[], Error>>}
   */
  public async execute(input: CandidatesVotersHistoryInput): Promise<Result<CandidatesVotersHistoryOutputItem[], Error>> {
    const queryModel = CandidatesVotersHistoryQueryModel.create(input);

    const allMatchingActionsRes = await this.actionRepository.aggregate(queryModel);
    if (allMatchingActionsRes.isFailure) {
      return Result.withFailure(allMatchingActionsRes.failure);
    }

    const paginatedActions = allMatchingActionsRes.content.slice(input.skip, input.skip + input.limit);

    const output: CandidatesVotersHistoryOutputItem[] = paginatedActions.map(action => {
      const data: any = action.deserializedAction.data;

      const item: CandidatesVotersHistoryOutputItem = {
        voter: data.voter,
        votingPower: 0n,
        candidate: input.candidateId,
        voteTimestamp: action.blockTimestamp,
        transactionId: action.transactionId,
        action: 'votecust',
      }

      return item;
    });

    return Result.withContent(output)
  }

  /*methods*/
}
