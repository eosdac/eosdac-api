import * as TokenWorldsCommon from '@alien-worlds/aw-contract-token-worlds';
import { inject, injectable, Result, UseCase } from '@alien-worlds/aw-core';

/**
 * The `GetDacTokensUseCase` class represents a use case for fetching DAC token statistics from the Token Worlds smart contract.
 * @class
 */
@injectable()
export class GetDacTokensUseCase
  implements UseCase<TokenWorldsCommon.Deltas.Entities.Stat[]>
{
  public static Token = 'GET_DAC_TOKENS_USE_CASE';

  /**
   * Creates an instance of the `GetDacTokensUseCase` use case with the specified dependencies.
   * @param {TokenWorldsCommon.Services.TokenWorldsContractService} tokenWorldsContractService - The service for interacting with the Token Worlds smart contract.
   */
  constructor(
    @inject(TokenWorldsCommon.Services.TokenWorldsContractService.Token)
    private tokenWorldsContractService: TokenWorldsCommon.Services.TokenWorldsContractService
  ) {}

  /**
   * Executes the use case to fetch DAC token statistics from the Token Worlds smart contract.
   * @async
   * @param {string} symbol - The symbol of the DAC token for which to fetch the statistics.
   * @returns {Promise<Result<TokenWorldsCommon.Deltas.Entities.Stat[]>>} - The result of the use case operation containing the fetched DAC token statistics.
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
