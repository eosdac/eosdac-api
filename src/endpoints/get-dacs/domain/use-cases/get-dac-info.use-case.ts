import { inject, injectable, Result, UseCase } from '@alien-worlds/api-core';
import { DaoWorldsContract } from '@alien-worlds/eosdac-api-common';

/*imports*/
/**
 * @class
 */
@injectable()
export class GetDacInfoUseCase
	implements UseCase<DaoWorldsContract.Deltas.Entities.DacGlobals[]>
{
	public static Token = 'GET_DAC_INFO_USE_CASE';

	constructor(
		/*injections*/
		@inject(DaoWorldsContract.Services.DaoWorldsContractService.Token)
		private daoWorldsContractService: DaoWorldsContract.Services.DaoWorldsContractService
	) { }

	/**
	 * @async
	 * @returns {Promise<Result<DaoWorldsContract
DaoWorldsContract.Deltas.Entities.DacGlobals[]>>}
	 */
	public async execute(
		dacId: string
	): Promise<Result<DaoWorldsContract.Deltas.Entities.DacGlobals[]>> {
		const { content: dacGlobals, failure: fetchDacGlobalsFailure } =
			await this.daoWorldsContractService.fetchDacGlobals({
				scope: dacId,
				limit: 1,
			});

		if (fetchDacGlobalsFailure) {
			return Result.withFailure(fetchDacGlobalsFailure);
		}

		return Result.withContent(
			dacGlobals.map(DaoWorldsContract.Deltas.Entities.DacGlobals.fromStruct)
		);
	}

	/*methods*/
}
