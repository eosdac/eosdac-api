import { inject, injectable, Result, UseCase } from '@alien-worlds/api-core';

import { CandidatesVotersHistoryOutputItem } from '../../data/dtos/candidates-voters-history.dto';
import { GetVotingPowerQueryModel } from '../models/get-voting-power.query-model';
import { VotingWeightRepository } from '../repositories/voting-weight.repository';

/*imports*/
/**
 * @class
 */
@injectable()
export class GetVotingPowerUseCase implements UseCase<bigint> {
  public static Token = 'GET_VOTING_POWER_USE_CASE';

  constructor(/*injections*/
    @inject(VotingWeightRepository.Token)
    private voteWeightRepository: VotingWeightRepository
  ) { }

  /**
   * @async
   * @returns {Promise<Result<bigint>>}
   */
  public async execute(data: CandidatesVotersHistoryOutputItem): Promise<Result<bigint>> {
    const model = GetVotingPowerQueryModel.create(data.voter, data.voteTimestamp)

    const weightRes = await this.voteWeightRepository.findOne(model)
    if (weightRes.isFailure) {
      return Result.withFailure(weightRes.failure)
    }

    return Result.withContent(weightRes.content?.weight || 0n);
  }

  /*methods*/
}

