import * as DaoWorldsCommon from '@alien-worlds/aw-contract-dao-worlds';
import { inject, injectable, Result, UseCase } from '@alien-worlds/aw-core';

import { CandidatesVotersHistoryInput } from '../models/candidates-voters-history.input';
import { VoteModel } from '../../data/dtos/candidates-voters-history.dto';
import { CandidatesVotersHistoryQueryBuilder } from '../models/candidates-voters-history.query-builder';

/**
 * Represents the use case for getting the voting history of candidates.
 * @class
 * @implements {UseCase<VoteModel[]>}
 */
@injectable()
export class GetCandidatesVotersHistoryUseCase implements UseCase<VoteModel[]> {
  public static Token = 'GET_CANDIDATES_VOTERS_HISTORY_USE_CASE';

  /**
   * Creates a new instance of GetCandidatesVotersHistoryUseCase.
   *
   * @constructor
   * @param {DaoWorldsCommon.Actions.DaoWorldsActionRepository} daoWorldsActionRepository - The repository for DAO worlds actions.
   */
  constructor(
    @inject(DaoWorldsCommon.Actions.DaoWorldsActionRepository.Token)
    private daoWorldsActionRepository: DaoWorldsCommon.Actions.DaoWorldsActionRepository
  ) {}

  /**
   * Executes the GetCandidatesVotersHistoryUseCase with the provided input.
   *
   * @async
   * @public
   * @param {CandidatesVotersHistoryInput} input - The input containing the DAC ID, candidate ID, skip, and limit.
   * @returns {Promise<Result<VoteModel[], Error>>} - A promise that resolves with a Result containing the voting history of candidates.
   */
  public async execute(
    input: CandidatesVotersHistoryInput
  ): Promise<Result<VoteModel[], Error>> {
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

    const output: VoteModel[] = paginatedActions.map(contractAction => {
      const { voter } =
        contractAction.data as DaoWorldsCommon.Actions.Entities.Votecust;

      const item: VoteModel = {
        voter,
        votingPower: 0,
        candidate: input.candidateId,
        voteTimestamp: contractAction.blockTimestamp,
        transactionId: contractAction.transactionId,
        action: DaoWorldsCommon.Actions.DaoWorldsActionName.Votecust,
      };

      return item;
    });

    return Result.withContent(output);
  }
}
