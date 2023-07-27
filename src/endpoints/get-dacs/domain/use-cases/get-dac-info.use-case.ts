import * as DaoWorldsCommon from '@alien-worlds/aw-contract-dao-worlds';
import { inject, injectable, Result, UseCase } from '@alien-worlds/aw-core';

/**
 * @class
 */
@injectable()
export class GetDacInfoUseCase
  implements UseCase<DaoWorldsCommon.Deltas.Entities.Dacglobals[]>
{
  public static Token = 'GET_DAC_INFO_USE_CASE';

  constructor(
    @inject(DaoWorldsCommon.Services.DaoWorldsContractService.Token)
    private daoWorldsContractService: DaoWorldsCommon.Services.DaoWorldsContractService
  ) {}

  /**
   * @async
   * @returns {Promise<Result<DaoWorldsCommon.Deltas.Entities.Dacglobals[]>>}
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
