import { inject, injectable, Result, UseCase } from '@alien-worlds/api-core';
import { ContractActionRepository, DaoWorldsContract } from '@alien-worlds/eosdac-api-common';

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
    @inject(ContractActionRepository.Token)
    private contractActionRepository: ContractActionRepository
  ) { }

  /**
   * @async
   * @returns {Promise<Result<CandidatesVotersHistoryOutputItem[], Error>>}
   */
  public async execute(input: CandidatesVotersHistoryInput): Promise<Result<CandidatesVotersHistoryOutputItem[], Error>> {
    const queryModel = CandidatesVotersHistoryQueryModel.create(input);

    const allMatchingActionsRes = await this.contractActionRepository.aggregate(queryModel);
    if (allMatchingActionsRes.isFailure) {
      return Result.withFailure(allMatchingActionsRes.failure);
    }

    const paginatedActions = allMatchingActionsRes.content.slice(input.skip, input.skip + input.limit);

    const output: CandidatesVotersHistoryOutputItem[] = paginatedActions.map(contractAction => {
      const voteCustData = (contractAction.action.data.toDocument() as DaoWorldsContract.Actions.Types.VotecustDocument);

      const item: CandidatesVotersHistoryOutputItem = {
        voter: voteCustData.voter,
        votingPower: 0n,
        candidate: input.candidateId,
        voteTimestamp: contractAction.blockTimestamp,
        transactionId: contractAction.transactionId,
        action: DaoWorldsContract.Actions.DaoWorldsActionName.Votecust,
      }

      return item;
    });

    return Result.withContent(output)
  }

  /*methods*/
}
