/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import * as StkvtWorldsCommon from '@alien-worlds/aw-contract-stkvt-worlds';
import { inject, injectable, Result, UseCase } from '@alien-worlds/aw-core';

import { VoteModel } from '../../data/dtos/candidates-voters-history.dto';
import { GetVotingPowerQueryBuilder } from '../models/get-voting-power.query-builder';

type Weights = StkvtWorldsCommon.Deltas.Entities.Weights;

/**
 * @class
 */
@injectable()
export class AssignVotingPowerUseCase implements UseCase<VoteModel[]> {
  public static Token = 'ASSIGN_VOTING_POWER_USE_CASE';

  constructor(
    @inject(StkvtWorldsCommon.Deltas.StkvtWorldsDeltaRepository.Token)
    private stkvtWorldsDeltaRepository: StkvtWorldsCommon.Deltas.StkvtWorldsDeltaRepository
  ) {}

  /**
   * @async
   * @returns {Promise<Result<VoteModel[]>>}
   */
  public async execute(models: VoteModel[]): Promise<Result<VoteModel[]>> {
    const promises = models.map(model =>
      this.stkvtWorldsDeltaRepository
        .find(
          new GetVotingPowerQueryBuilder().with({
            voter: model.voter,
            voteTimestamp: model.voteTimestamp,
          })
        )
        .then(({ content: deltas, failure }) => {
          if (!failure && deltas[0]?.data) {
            model.votingPower = (deltas[0].data as Weights).weight;
          }
        })
        .catch(error => {})
    );

    await Promise.all(promises);

    return Result.withContent(models);
  }
}
