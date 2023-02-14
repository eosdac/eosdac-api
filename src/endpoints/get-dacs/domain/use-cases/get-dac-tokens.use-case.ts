import { inject, injectable } from 'inversify';
import { Result, UseCase } from '@alien-worlds/api-core';
import { TokenWorldsContract } from '@alien-worlds/eosdac-api-common';
/*imports*/
/**
 * @class
 */
@injectable()
export class GetDacTokensUseCase
	implements UseCase<TokenWorldsContract.Deltas.Entities.Stat[]>
{
	public static Token = 'GET_DAC_TOKENS_USE_CASE';

	constructor(
		/*injections*/
		@inject(TokenWorldsContract.Services.TokenWorldsContractService.Token)
		private tokenWorldsContractService: TokenWorldsContract.Services.TokenWorldsContractService
	) {}

	/**
	 * @async
	 * @returns {Promise<Result<Stat[]>>}
	 */
	public async execute(
		symbol: string
	): Promise<Result<TokenWorldsContract.Deltas.Entities.Stat[]>> {
		const { content: dacTokenStats, failure: fetchDacGlobalsFailure } =
			await this.tokenWorldsContractService.fetchStat({
				scope: symbol,
				limit: 100,
			});

		if (fetchDacGlobalsFailure) {
			return Result.withFailure(fetchDacGlobalsFailure);
		}

		return Result.withContent(
			dacTokenStats.map(TokenWorldsContract.Deltas.Entities.Stat.fromStruct)
		);
	}

	/*methods*/
}
