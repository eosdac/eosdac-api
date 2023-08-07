import * as DaoWorldsCommon from '@alien-worlds/aw-contract-dao-worlds';

import { inject, injectable, Result, UseCase } from '@alien-worlds/aw-core';

/**
 * Represents the use case for getting custodians.
 * @class
 */
@injectable()
export class GetCustodiansUseCase
  implements UseCase<DaoWorldsCommon.Deltas.Entities.Custodians1[]>
{
  public static Token = 'GET_CUSTODIANS_USE_CASE';

  /**
   * Creates an instance of GetCustodiansUseCase.
   * @constructor
   * @param {DaoWorldsCommon.Services.DaoWorldsContractService} daoWorldsContractService - The service used for interacting with the DaoWorlds contract.
   */
  constructor(
    @inject(DaoWorldsCommon.Services.DaoWorldsContractService.Token)
    private daoWorldsContractService: DaoWorldsCommon.Services.DaoWorldsContractService
  ) {}

  /**
   * Executes the GetCustodiansUseCase to fetch custodians based on the given DAC ID and an optional limit.
   *
   * @async
   * @public
   * @param {string} dacId - The DAC ID for which to fetch custodians.
   * @param {number} [limit=5] - The optional limit on the number of custodians to fetch.
   * @returns {Promise<Result<DaoWorldsCommon.Deltas.Entities.Custodians1[]>>} - A Promise that resolves to a Result containing an array of Custodians1 entities or a failure object in case of an error.
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
