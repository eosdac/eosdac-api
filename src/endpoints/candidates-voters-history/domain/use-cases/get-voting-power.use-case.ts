import * as StkvtWorldsCommon from '@alien-worlds/stkvt-worlds-common';
import { inject, injectable, Result, UseCase } from '@alien-worlds/api-core';

import { CandidatesVotersHistoryOutputItem } from '../../data/dtos/candidates-voters-history.dto';
import { GetVotingPowerQueryBuilder } from '../models/get-voting-power.query-model';

/**
 * @class
 */
@injectable()
export class GetVotingPowerUseCase implements UseCase<number> {
  public static Token = 'GET_VOTING_POWER_USE_CASE';

  constructor(
    @inject(StkvtWorldsCommon.Deltas.StkvtWorldsDeltaRepository.Token)
    private stkvtWorldsDeltaRepository: StkvtWorldsCommon.Deltas.StkvtWorldsDeltaRepository
  ) {}

  /**
   * @async
   * @returns {Promise<Result<number>>}
   */
  public async execute(
    data: CandidatesVotersHistoryOutputItem
  ): Promise<Result<number>> {
    const queryBuilder = new GetVotingPowerQueryBuilder().with({
      voter: data.voter,
      voteTimestamp: data.voteTimestamp,
    });

    const weightRes = await this.stkvtWorldsDeltaRepository.find(queryBuilder);
    if (weightRes.isFailure) {
      return Result.withFailure(weightRes.failure);
    }

    const entity = weightRes.content[0]
      ?.data as StkvtWorldsCommon.Deltas.Entities.Weights;

    return Result.withContent(entity?.weight || 0);
  }
}
