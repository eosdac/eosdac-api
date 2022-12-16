
import { inject, injectable } from 'inversify';
import { Result, UseCase } from '@alien-worlds/api-core';
import { Stat, TokenWorldsContractService } from '@alien-worlds/eosdac-api-common';
/*imports*/
/**
 * @class
 */
@injectable()
export class GetDacTokensUseCase implements UseCase<Stat[]> {
  public static Token = 'GET_DAC_TOKENS_USE_CASE';

  constructor(/*injections*/
    @inject(TokenWorldsContractService.Token)
    private tokenWorldsContractService: TokenWorldsContractService
  ) { }

  /**
   * @async
   * @returns {Promise<Result<Stat[]>>}
   */
  public async execute(symbol: string): Promise<Result<Stat[]>> {
    const { content: dacTokenStats, failure: fetchDacGlobalsFailure } =
      await this.tokenWorldsContractService.fetchStats({
        scope: symbol,
        limit: 100,
      })

    if (fetchDacGlobalsFailure) {
      return Result.withFailure(fetchDacGlobalsFailure);
    }

    return Result.withContent(dacTokenStats.map(Stat.fromTableRow))
  }

  /*methods*/
}

