import * as DaoWorldsCommon from '@alien-worlds/aw-contract-dao-worlds';
import { inject, injectable, Result, UseCase } from '@alien-worlds/aw-core';

/**
 * The `GetDacInfoUseCase` class represents a use case for fetching DAC information from the DAO Worlds smart contract.
 * @class
 */
@injectable()
export class GetDacInfoUseCase
  implements UseCase<DaoWorldsCommon.Deltas.Entities.Dacglobals[]>
{
  public static Token = 'GET_DAC_INFO_USE_CASE';

  /**
   * Creates an instance of the `GetDacInfoUseCase` use case with the specified dependencies.
   * @param {DaoWorldsCommon.Services.DaoWorldsContractService} daoWorldsContractService - The service for interacting with the DAO Worlds smart contract.
   */
  constructor(
    @inject(DaoWorldsCommon.Services.DaoWorldsContractService.Token)
    private daoWorldsContractService: DaoWorldsCommon.Services.DaoWorldsContractService
  ) {}

  /**
   * Executes the use case to fetch DAC information from the DAO Worlds smart contract.
   * @async
   * @param {string} dacId - The DAC ID for which to fetch the information.
   * @returns {Promise<Result<DaoWorldsCommon.Deltas.Entities.Dacglobals[]>>} - The result of the use case operation containing the fetched DAC information.
   */
  public async execute(
    dacId: string
  ): Promise<Result<DaoWorldsCommon.Deltas.Entities.Dacglobals[]>> {
    const { content: dacGlobals, failure: fetchDacGlobalsFailure } =
      await this.daoWorldsContractService.fetchDacglobals({
        scope: dacId,
        limit: 1,
      });

    if (fetchDacGlobalsFailure) {
      return Result.withFailure(fetchDacGlobalsFailure);
    }

    const dacglobalsRawMapper =
      new DaoWorldsCommon.Deltas.Mappers.DacglobalsRawMapper();

    return Result.withContent(dacGlobals.map(dacglobalsRawMapper.toEntity));
  }
}
