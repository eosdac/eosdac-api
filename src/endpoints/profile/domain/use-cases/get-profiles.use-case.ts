import { Long, Result, UseCase } from '@alien-worlds/api-core';
import { ActionRepository } from '@alien-worlds/eosdac-api-common';
import { inject, injectable } from 'inversify';

import { GetProfilesUseCaseInput } from '../../data/dtos/profile.dto';
import { Profile } from '../entities/profile';
import { ProfileQueryModel } from '../models/profile.query-model';

/*imports*/
/**
 * @class
 */
@injectable()
export class GetProfilesUseCase implements UseCase<Profile[]> {
  public static Token = 'GET_PROFILES_USE_CASE';

  constructor(/*injections*/
    @inject(ActionRepository.Token)
    private actionRepository: ActionRepository
  ) { }

  /**
   * @async
   * @returns {Promise<Result<Profile[]>>}
   */
  public async execute(input: GetProfilesUseCaseInput): Promise<Result<Profile[]>> {
    let queryModel = ProfileQueryModel.create({
      custContract: input.custContract,
      dacId: input.dacId,
      accounts: input.accounts,
    });

    const actionsRes = await this.actionRepository.aggregate(queryModel);
    if (actionsRes.isFailure) {
      return Result.withFailure(actionsRes.failure)
    }

    const profiles = actionsRes.content.map(action => {
      const data: any = action.deserializedAction.data;

      return Profile.fromDto({
        action: action.deserializedAction,
        profile: data.profile,
        block_num: Long.fromBigInt(action.blockNumber),
      })
    });

    return Result.withContent(profiles)
  }

  /*methods*/
}
