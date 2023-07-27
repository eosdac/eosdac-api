import * as DaoWorldsCommon from '@alien-worlds/aw-contract-dao-worlds';
import {
  ContractAction,
  inject,
  injectable,
  Result,
  UseCase,
} from '@alien-worlds/aw-core';

import { GetProfilesUseCaseInput } from '../../data/dtos/profile.dto';
import { ProfileQueryBuilder } from '../models/profile.query-builder';

/**
 * @class
 */
@injectable()
export class GetProfilesUseCase
  implements
    UseCase<
      ContractAction<
        DaoWorldsCommon.Actions.Entities.Stprofile,
        DaoWorldsCommon.Actions.Types.StprofileMongoModel
      >[]
    >
{
  public static Token = 'GET_PROFILES_USE_CASE';

  constructor(
    @inject(DaoWorldsCommon.Actions.DaoWorldsActionRepository.Token)
    private daoWorldsActionRepository: DaoWorldsCommon.Actions.DaoWorldsActionRepository
  ) {}

  /**
   * @async
   * @returns {Promise<Result<ContractAction<DaoWorldsCommon.Actions.Entities.Stprofile,DaoWorldsCommon.Actions.Types.StprofileMongoModel>[]>>}
   */
  public async execute(
    input: GetProfilesUseCaseInput
  ): Promise<
    Result<
      ContractAction<
        DaoWorldsCommon.Actions.Entities.Stprofile,
        DaoWorldsCommon.Actions.Types.StprofileMongoModel
      >[]
    >
  > {
    const queryBuilder = new ProfileQueryBuilder().with({
      custContract: input.custContract,
      dacId: input.dacId,
      accounts: input.accounts,
    });

    const actionsRes = await this.daoWorldsActionRepository.aggregate(
      queryBuilder
    );
    if (actionsRes.isFailure) {
      return Result.withFailure(actionsRes.failure);
    }

    return Result.withContent(
      actionsRes.content as ContractAction<
        DaoWorldsCommon.Actions.Entities.Stprofile,
        DaoWorldsCommon.Actions.Types.StprofileMongoModel
      >[]
    );
  }
}
