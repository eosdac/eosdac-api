import {
	Custodian,
	DaoWorldsContractService,
} from '@alien-worlds/eosdac-api-common';
import { injectable, Result, UseCase } from '@alien-worlds/api-core';
import { inject } from 'inversify';

/*imports*/
/**
 * @class
 */
@injectable()
export class GetCustodiansUseCase implements UseCase<Custodian[]> {
	public static Token = 'GET_CUSTODIANS_USE_CASE';

	constructor(
		/*injections*/
		@inject(DaoWorldsContractService.Token)
		private service: DaoWorldsContractService
	) {}

	/**
	 * @async
	 * @returns {Promise<Result<Custodian[]>>}
	 */
	public async execute(dacId: string, limit = 5): Promise<Result<Custodian[]>> {
		const { content: rows, failure } = await this.service.fetchCustodians({
			scope: dacId.toLowerCase(),
			limit,
		});

		if (failure) {
			return Result.withFailure(failure);
		}

		if (rows.length === 0) {
			return Result.withContent([]);
		}

		const custodians = rows.map(row => Custodian.fromTableRow(row));

		return Result.withContent(custodians);
	}

	/*methods*/
}
