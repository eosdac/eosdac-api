import {
  ContractAction,
  inject,
  injectable,
  Result,
  UseCase,
} from '@alien-worlds/api-core';
import { DaoWorldsContract } from '@alien-worlds/dao-api-common';
import { GetProfilesUseCaseInput } from '../../data/dtos/profile.dto';
import { ProfileQueryModel } from '../models/profile.query-model';
import { DaoWorldsActionRepository } from '@alien-worlds/dao-api-common/build/contracts/dao-worlds/actions/domain/repositories';

/*imports*/
/**
 * @class
 */
@injectable()
export class GetProfilesUseCase
  implements
    UseCase<
      ContractAction<
        DaoWorldsContract.Actions.Entities.SetProfile,
        DaoWorldsContract.Actions.Types.StprofileDocument
      >[]
    >
{
  public static Token = 'GET_PROFILES_USE_CASE';

  constructor(
    /*injections*/
    @inject(DaoWorldsActionRepository.Token)
    private daoWorldsActionRepository: DaoWorldsActionRepository
  ) {}

  /**
   * @async
   * @returns {Promise<Result<Profile[]>>}
   */
  public async execute(
    input: GetProfilesUseCaseInput
  ): Promise<
    Result<
      ContractAction<
        DaoWorldsContract.Actions.Entities.SetProfile,
        DaoWorldsContract.Actions.Types.StprofileDocument
      >[]
    >
  > {
    const queryModel = ProfileQueryModel.create({
      custContract: input.custContract,
      dacId: input.dacId,
      accounts: input.accounts,
    });

    const actionsRes = await this.daoWorldsActionRepository.aggregate(
      queryModel
    );
    if (actionsRes.isFailure) {
      return Result.withFailure(actionsRes.failure);
    }

    return Result.withContent(
      actionsRes.content as ContractAction<
        DaoWorldsContract.Actions.Entities.SetProfile,
        DaoWorldsContract.Actions.Types.StprofileDocument
      >[]
    );
  }

  /*methods*/
}
