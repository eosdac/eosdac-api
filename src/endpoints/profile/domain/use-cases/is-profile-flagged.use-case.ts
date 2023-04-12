import {
  DaoWorldsContract,
  FlagRepository,
} from '@alien-worlds/dao-api-common';
import { inject, injectable, Result, UseCase } from '@alien-worlds/api-core';
import { IsProfileFlaggedQueryModel } from '../models/is-profile-flagged.query-model';
import { IsProfileFlaggedUseCaseInput } from '../../data/dtos/profile.dto';

/*imports*/
/**
 * @class
 */
@injectable()
export class IsProfileFlaggedUseCase
  implements UseCase<DaoWorldsContract.Actions.Entities.FlagCandidateProfile[]>
{
  public static Token = 'IS_PROFILE_FLAGGED_USE_CASE';

  constructor(
    /*injections*/
    @inject(FlagRepository.Token)
    private flagRepository: FlagRepository
  ) {}

  /**
   * @async
   * @returns {Promise<Result<IsProfileFlaggedUseCaseOutput[]>>}
   */
  public async execute(
    input: IsProfileFlaggedUseCaseInput
  ): Promise<
    Result<DaoWorldsContract.Actions.Entities.FlagCandidateProfile[]>
  > {
    let output: DaoWorldsContract.Actions.Entities.FlagCandidateProfile[];

    if (input.accounts.length > 0) {
      const queryModel = IsProfileFlaggedQueryModel.create({
        dacId: input.dacId,
        accounts: input.accounts,
      });

      const result = await this.flagRepository.aggregate(queryModel);
      if (result.isFailure) {
        return Result.withFailure(result.failure);
      }

      output = result.content;
    }

    return Result.withContent(output);
  }

  /*methods*/
}
