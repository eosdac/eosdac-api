import * as DaoWorldsCommon from '@alien-worlds/aw-contract-dao-worlds';
import { inject, injectable, Result, UseCase } from '@alien-worlds/aw-core';

import { FlagRepository } from '../repositories/flag.repository';
import { ListProfileFlagsQueryBuilder } from '../models/list-profile-flags.query-builder';

/**
 * @class
 */
@injectable()
export class GetProfileFlagsUseCase
  implements UseCase<DaoWorldsCommon.Actions.Entities.Flagcandprof[]>
{
  public static Token = 'GET_PROFILE_FLAGS_USE_CASE';

  constructor(
    @inject(FlagRepository.Token)
    private flagRepository: FlagRepository
  ) {}

  /**
   * @async
   * @returns {Promise<Result<DaoWorldsCommon.Actions.Entities.Flagcandprof[]>>}
   */
  public async execute(
    dacId: string,
    accounts: string[]
  ): Promise<Result<DaoWorldsCommon.Actions.Entities.Flagcandprof[]>> {
    let output: DaoWorldsCommon.Actions.Entities.Flagcandprof[];

    if (accounts.length > 0) {
      const queryBuilder = new ListProfileFlagsQueryBuilder().with({
        dacId: dacId,
        accounts: accounts,
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
