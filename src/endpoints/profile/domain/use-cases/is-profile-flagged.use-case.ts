import * as DaoWorldsCommon from '@alien-worlds/aw-contract-dao-worlds';
import { inject, injectable, Result, UseCase } from '@alien-worlds/aw-core';

import { FlagRepository } from '../repositories/flag.repository';
import { IsProfileFlaggedQueryBuilder } from '../models/is-profile-flagged.query-model';
import { IsProfileFlaggedUseCaseInput } from '../../data/dtos/profile.dto';

/**
 * @class
 */
@injectable()
export class IsProfileFlaggedUseCase
  implements UseCase<DaoWorldsCommon.Actions.Entities.Flagcandprof[]>
{
  public static Token = 'IS_PROFILE_FLAGGED_USE_CASE';

  constructor(
    @inject(FlagRepository.Token)
    private flagRepository: FlagRepository
  ) {}

  /**
   * @async
   * @returns {Promise<Result<IsProfileFlaggedUseCaseOutput[]>>}
   */
  public async execute(
    input: IsProfileFlaggedUseCaseInput
  ): Promise<Result<DaoWorldsCommon.Actions.Entities.Flagcandprof[]>> {
    let output: DaoWorldsCommon.Actions.Entities.Flagcandprof[];

    if (input.accounts.length > 0) {
      const queryBuilder = new IsProfileFlaggedQueryBuilder().with({
        dacId: input.dacId,
        accounts: input.accounts,
      });

      const result = await this.flagRepository.aggregate(queryBuilder);
      if (result.isFailure) {
        return Result.withFailure(result.failure);
      }

      if (
        result.content instanceof DaoWorldsCommon.Actions.Entities.Flagcandprof
      ) {
        output = [result.content];
      } else {
        output = result.content;
      }
    }

    return Result.withContent(output);
  }
}
