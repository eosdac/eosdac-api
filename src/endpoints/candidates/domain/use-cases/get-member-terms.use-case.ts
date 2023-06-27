import * as TokenWorldsCommon from '@alien-worlds/token-worlds-common';
import { inject, injectable, Result, UseCase } from '@alien-worlds/api-core';

/**
 * @class
 */
@injectable()
export class GetMemberTermsUseCase
  implements UseCase<TokenWorldsCommon.Deltas.Entities.Memberterms>
{
  public static Token = 'GET_MEMBER_TERMS_USE_CASE';

  constructor(
    @inject(TokenWorldsCommon.Services.TokenWorldsContractService.Token)
    private service: TokenWorldsCommon.Services.TokenWorldsContractService
  ) {}

  /**
   * @async
   * @returns {Promise<Result<MemberTerms>>}
   */
  public async execute(
    dacId: string,
    limit = 1
  ): Promise<Result<TokenWorldsCommon.Deltas.Entities.Memberterms>> {
    const { content: rows, failure } = await this.service.fetchMemberterms({
      scope: dacId.toLowerCase(),
      limit,
      reverse: true,
    });

    if (failure) {
      return Result.withFailure(failure);
    }

    return Result.withContent(
      rows.length === 0
        ? null
        : new TokenWorldsCommon.Deltas.Mappers.MembertermsRawMapper().toEntity(
            rows[0]
          )
    );
  }
}
