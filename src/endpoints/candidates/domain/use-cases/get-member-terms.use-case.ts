import { inject, injectable, Result, UseCase } from '@alien-worlds/api-core';
import {
	TokenWorldsContract,
} from '@alien-worlds/eosdac-api-common';

/*imports*/

const {
	Entities: { MemberTerms },
} = TokenWorldsContract.Deltas;

/**
 * @class
 */
@injectable()
export class GetMemberTermsUseCase
	implements UseCase<TokenWorldsContract.Deltas.Entities.MemberTerms>
{
	public static Token = 'GET_MEMBER_TERMS_USE_CASE';

	constructor(
		/*injections*/
		@inject(TokenWorldsContract.Services.TokenWorldsContractService.Token)
		private service: TokenWorldsContract.Services.TokenWorldsContractService
	) { }

	/**
	 * @async
	 * @returns {Promise<Result<MemberTerms>>}
	 */
	public async execute(
		dacId: string,
		limit = 1
	): Promise<Result<TokenWorldsContract.Deltas.Entities.MemberTerms>> {
		const { content: rows, failure } = await this.service.fetchMemberTerms({
			scope: dacId.toLowerCase(),
			code: 'token.worlds',
			limit,
		});

		if (failure) {
			return Result.withFailure(failure);
		}

		return Result.withContent(
			rows.length === 0 ? null : MemberTerms.fromStruct(rows[0])
		);
	}

	/*methods*/
}
