import { injectable, Result, UseCase } from '@alien-worlds/api-core';
import { MemberTerms, TokenWorldsContractService } from '@alien-worlds/eosdac-api-common';
import { inject } from 'inversify';

/*imports*/

/**
 * @class
 */
@injectable()
export class GetMemberTermsUseCase implements UseCase<MemberTerms> {
  public static Token = 'GET_MEMBER_TERMS_USE_CASE';

  constructor(/*injections*/
    @inject(TokenWorldsContractService.Token)
    private service: TokenWorldsContractService
  ) { }

  /**
   * @async
   * @returns {Promise<Result<MemberTerms>>}
   */
  public async execute(dacId: string, limit = 1): Promise<Result<MemberTerms>> {
    const { content: rows, failure } = await this.service.fetchMemberTerms({ scope: dacId.toLowerCase(), limit });

    if (failure) {
      return Result.withFailure(failure);
    }

    return Result.withContent(rows.length === 0 ? null: MemberTerms.fromTableRow(rows[0]));
  }

  /*methods*/
}
