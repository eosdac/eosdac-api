import * as DaoWorldsCommon from '@alien-worlds/dao-worlds-common';

import { inject, injectable, Result, UseCase } from '@alien-worlds/api-core';

/**
 * @class
 */
@injectable()
export class GetCustodiansUseCase
  implements UseCase<DaoWorldsCommon.Deltas.Entities.Custodians1[]>
{
  public static Token = 'GET_CUSTODIANS_USE_CASE';

  constructor(
    @inject(DaoWorldsCommon.Services.DaoWorldsContractService.Token)
    private daoWorldsContractService: DaoWorldsCommon.Services.DaoWorldsContractService
  ) {}

  /**
   * @async
   * @returns {Promise<Result<DaoWorldsCommon.Deltas.Entities.Custodians1[]>>}
   */
  public async execute(
    dacId: string,
    limit = 5
  ): Promise<Result<DaoWorldsCommon.Deltas.Entities.Custodians1[]>> {
    const { content: rows, failure } =
      await this.daoWorldsContractService.fetchCustodians1({
        scope: dacId.toLowerCase(),
        limit,
      });

    if (failure) {
      return Result.withFailure(failure);
    }

    const custodians1RawMapper =
      new DaoWorldsCommon.Deltas.Mappers.Custodians1RawMapper();

    const custodians = rows.map(custodians1RawMapper.toEntity);

    return Result.withContent(custodians);
  }
}
