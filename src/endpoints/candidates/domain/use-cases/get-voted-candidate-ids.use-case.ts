import { DaoWorldsContract } from '@alien-worlds/eosdac-api-common';
import { injectable, Result, UseCase } from '@alien-worlds/api-core';
import { inject } from 'inversify';

/*imports*/
/**
 * @class
 */
@injectable()
export class GetVotedCandidateIdsUseCase implements UseCase<string[]> {
	public static Token = 'GET_VOTED_CANDIDATE_IDS_USE_CASE';

	constructor(
		/*injections*/
		@inject(DaoWorldsContract.Services.DaoWorldsContractService.Token)
		private service: DaoWorldsContract.Services.DaoWorldsContractService
	) {}

	/**
	 * @async
	 * @returns {Promise<Result<string[]>>}
	 */
	public async execute(
		walletId: string,
		dacId: string
	): Promise<Result<string[]>> {
		const { content: rows, failure } = await this.service.fetchVote({
			scope: dacId.toLowerCase(),
			code: 'dao.worlds',
			limit: 1,
			lower_bound: walletId,
			upper_bound: walletId,
		});

		if (failure) {
			return Result.withFailure(failure);
		}

		const ids = rows[0].candidates || [];

		return Result.withContent(ids);
	}

	/*methods*/
}
