import { Result, UseCase } from '@alien-worlds/api-core';
import { DacGlobals, DaoWorldsContractService } from '@alien-worlds/eosdac-api-common';
import { inject, injectable } from 'inversify';

/*imports*/
/**
 * @class
 */
@injectable()
export class GetDacInfoUseCase implements UseCase<DacGlobals[]> {
  public static Token = 'GET_DAC_INFO_USE_CASE';

  constructor(/*injections*/
    @inject(DaoWorldsContractService.Token)
    private daoWorldsContractService: DaoWorldsContractService
  ) { }

  /**
   * @async
   * @returns {Promise<Result<DacGlobals[]>>}
   */
  public async execute(dacId: string): Promise<Result<DacGlobals[]>> {
    const { content: dacGlobals, failure: fetchDacGlobalsFailure } =
      await this.daoWorldsContractService.fetchDacGlobals({
        scope: dacId,
        limit: 1,
      })

    if (fetchDacGlobalsFailure) {
      return Result.withFailure(fetchDacGlobalsFailure);
    }

    return Result.withContent(dacGlobals.map(DacGlobals.fromTableRow))
  }

  /*methods*/
}

