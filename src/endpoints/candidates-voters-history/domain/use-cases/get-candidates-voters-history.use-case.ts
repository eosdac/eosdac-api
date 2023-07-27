import * as DaoWorldsCommon from '@alien-worlds/aw-contract-dao-worlds';
import { inject, injectable, Result, UseCase } from '@alien-worlds/aw-core';

import { CandidatesVotersHistoryInput } from '../models/candidates-voters-history.input';
import { CandidatesVotersHistoryOutputItem } from '../../data/dtos/candidates-voters-history.dto';
import { CandidatesVotersHistoryQueryBuilder } from '../models/candidates-voters-history.query-builder';

/**
 * @class
 */
@injectable()
export class GetCandidatesVotersHistoryUseCase
  implements UseCase<CandidatesVotersHistoryOutputItem[]>
{
  public static Token = 'GET_CANDIDATES_VOTERS_HISTORY_USE_CASE';

  constructor(
    @inject(DaoWorldsCommon.Actions.DaoWorldsActionRepository.Token)
    private daoWorldsActionRepository: DaoWorldsCommon.Actions.DaoWorldsActionRepository
  ) {}

  /**
   * @async
   * @returns {Promise<Result<CandidatesVotersHistoryOutputItem[], Error>>}
   */
  public async execute(
    input: CandidatesVotersHistoryInput
  ): Promise<Result<CandidatesVotersHistoryOutputItem[], Error>> {
    const queryBuilder = new CandidatesVotersHistoryQueryBuilder().with({
      ...input,
    });

    const allMatchingActionsRes: any =
      await this.daoWorldsActionRepository.aggregate(queryBuilder);
    if (allMatchingActionsRes.isFailure) {
      return Result.withFailure(allMatchingActionsRes.failure);
    }

    const paginatedActions = allMatchingActionsRes.content.slice(
      input.skip,
      input.skip + input.limit
    );

    const output: CandidatesVotersHistoryOutputItem[] = paginatedActions.map(
      contractAction => {
        const { voter } =
          contractAction.data as DaoWorldsCommon.Actions.Entities.Votecust;

        const item: CandidatesVotersHistoryOutputItem = {
          voter,
          votingPower: 0,
          candidate: input.candidateId,
          voteTimestamp: contractAction.blockTimestamp,
          transactionId: contractAction.transactionId,
          action: DaoWorldsCommon.Actions.DaoWorldsActionName.Votecust,
        };

        return item;
      }
    );

    return Result.withContent(output);
  }
}
