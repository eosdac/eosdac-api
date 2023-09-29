import { Actions } from '@alien-worlds/aw-contract-dao-worlds';
import { ContractAction, inject, injectable, Result, UseCase } from '@alien-worlds/aw-core';
import { ActionToProfileMapper } from '@endpoints/profile/data/mappers/action-to-profile.mapper';

import { Profile } from '../entities/profile';
import { ListProfileActionsQueryBuilder } from '../models/list-profile-actions.query-builder';

/**
 * @class
 */
@injectable()
export class GetProfilesUseCase implements UseCase<Profile[]> {
  public static Token = 'GET_PROFILES_USE_CASE';

  constructor(
    @inject(Actions.DaoWorldsActionRepository.Token)
    private daoWorldsActionRepository: Actions.DaoWorldsActionRepository
  ) { }

  /**
   * @async
   * @returns {Promise<Result<ContractAction<Actions.Entities.Stprofile,Actions.Types.StprofileMongoModel>[]>>}
   */
  public async execute(
    custodian: string,
    dacId: string,
    accounts: string[]
  ): Promise<Result<Profile[]>> {
    const queryBuilder = new ListProfileActionsQueryBuilder().with({
      custodian,
      dacId: dacId,
      accounts: accounts,
    });

    const { content: actions, failure } =
      await this.daoWorldsActionRepository.aggregate<
        ContractAction<
          Actions.Entities.Stprofile,
          Actions.Types.StprofileMongoModel
        >[]
      >(queryBuilder);

    if (failure) {
      return Result.withFailure(failure);
    }

    const profiles = actions.map(action => ActionToProfileMapper.toEntity(action));

    return Result.withContent(profiles);
  }
}
