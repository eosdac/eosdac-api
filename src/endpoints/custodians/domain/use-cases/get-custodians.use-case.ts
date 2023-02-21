import { inject, injectable, Result, UseCase } from '@alien-worlds/api-core';
import { DaoWorldsContract } from '@alien-worlds/eosdac-api-common';

/*imports*/
/**
 * @class
 */
@injectable()
export class GetCustodiansUseCase
	implements UseCase<DaoWorldsContract.Deltas.Entities.Custodian[]>
{
	public static Token = 'GET_CUSTODIANS_USE_CASE';

	constructor(
		/*injections*/
		@inject(DaoWorldsContract.Services.DaoWorldsContractService.Token)
		private service: DaoWorldsContract.Services.DaoWorldsContractService
	) { }

	/**
	 * @async
	 * @returns {Promise<Result<Custodian[]>>}
	 */
	public async execute(
		dacId: string,
		limit = 5
	): Promise<Result<DaoWorldsContract.Deltas.Entities.Custodian[]>> {
		const { content: rows, failure } = await this.service.fetchCustodian({
			scope: dacId.toLowerCase(),
			code: 'dao.worlds',
			limit,
		});

		if (failure) {
			return Result.withContent([]);
		}

		const custodians = rows.map(row =>
			DaoWorldsContract.Deltas.Entities.Custodian.fromStruct(row)
		);

		return Result.withContent(custodians);
	}

	/*methods*/
}
