/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import * as StkvtWorldsCommon from '@alien-worlds/aw-contract-stkvt-worlds';
import { inject, injectable, Result, UseCase } from '@alien-worlds/aw-core';

import { VoteModel } from '../../data/dtos/candidates-voters-history.dto';
import { GetVotingPowerQueryBuilder } from '../models/get-voting-power.query-builder';

type Weights = StkvtWorldsCommon.Deltas.Entities.Weights;

/**
 * Represents the use case for assigning voting power to an array of VoteModel objects.
 * @class
 * @implements {UseCase<VoteModel[]>}
 */
@injectable()
export class AssignVotingPowerUseCase implements UseCase<VoteModel[]> {
  public static Token = 'ASSIGN_VOTING_POWER_USE_CASE';
  /**
   * Creates a new instance of AssignVotingPowerUseCase.
   *
   * @constructor
   * @param {StkvtWorldsCommon.Deltas.StkvtWorldsDeltaRepository} stkvtWorldsDeltaRepository - The repository for stkvt worlds deltas.
   */
  constructor(
    @inject(StkvtWorldsCommon.Deltas.StkvtWorldsDeltaRepository.Token)
    private stkvtWorldsDeltaRepository: StkvtWorldsCommon.Deltas.StkvtWorldsDeltaRepository
  ) {}

  /**
   * Executes the AssignVotingPowerUseCase with the provided array of VoteModel objects.
   *
   * @async
   * @public
   * @param {VoteModel[]} models - The array of VoteModel objects.
   * @returns {Promise<Result<VoteModel[]>>} - A promise that resolves with a Result containing the updated array of VoteModel objects.
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
