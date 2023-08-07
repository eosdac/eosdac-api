import * as TokenWorldsCommon from '@alien-worlds/aw-contract-token-worlds';
import { inject, injectable, Result, UseCase } from '@alien-worlds/aw-core';

/**
 * Represents a use case for retrieving member terms for a specific DAC.
 * @class
 * @implements {UseCase<TokenWorldsCommon.Deltas.Entities.Memberterms>}
 */
@injectable()
export class GetMemberTermsUseCase
  implements UseCase<TokenWorldsCommon.Deltas.Entities.Memberterms>
{
  public static Token = 'GET_MEMBER_TERMS_USE_CASE';

  /**
   * @constructor
   * @param {TokenWorldsCommon.Services.TokenWorldsContractService} service - The service used to interact with the TokenWorlds contract.
   */
  constructor(
    @inject(TokenWorldsCommon.Services.TokenWorldsContractService.Token)
    private service: TokenWorldsCommon.Services.TokenWorldsContractService
  ) {}

  /**
   * Executes the GetMemberTermsUseCase to retrieve the member terms for a specific DAC.
   *
   * @async
   * @public
   * @param {string} dacId - The ID of the DAC to retrieve the member terms for.
   * @param {number} [limit=1] - The maximum number of member terms to retrieve (default: 1).
   * @returns {Promise<Result<TokenWorldsCommon.Deltas.Entities.Memberterms>>} - The result containing the member terms object.
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
