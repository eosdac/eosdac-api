import * as TokenWorldsCommon from '@alien-worlds/token-worlds-common';
import { inject, injectable, Result, UseCase } from '@alien-worlds/api-core';

/**
 * @class
 */
@injectable()
export class GetDacTokensUseCase
  implements UseCase<TokenWorldsCommon.Deltas.Entities.Stat[]>
{
  public static Token = 'GET_DAC_TOKENS_USE_CASE';

  constructor(
    @inject(TokenWorldsCommon.Services.TokenWorldsContractService.Token)
    private tokenWorldsContractService: TokenWorldsCommon.Services.TokenWorldsContractService
  ) {}

  /**
   * @async
   * @returns {Promise<Result<TokenWorldsCommon.Deltas.Entities.Stat[]>>}
   */
  public async execute(
    symbol: string
  ): Promise<Result<TokenWorldsCommon.Deltas.Entities.Stat[]>> {
    const { content: dacTokenStats, failure: fetchDacGlobalsFailure } =
      await this.tokenWorldsContractService.fetchStat({
        scope: symbol,
        limit: 100,
      });

    if (fetchDacGlobalsFailure) {
      return Result.withFailure(fetchDacGlobalsFailure);
    }

    const statRawMapper = new TokenWorldsCommon.Deltas.Mappers.StatRawMapper();
    return Result.withContent(dacTokenStats.map(statRawMapper.toEntity));
  }
}
