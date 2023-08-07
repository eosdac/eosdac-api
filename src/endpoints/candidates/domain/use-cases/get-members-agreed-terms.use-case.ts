import * as TokenWorldsCommon from '@alien-worlds/aw-contract-token-worlds';
import { inject, injectable, Result, UseCase } from '@alien-worlds/aw-core';

/**
 * Represents a use case for retrieving members' agreed terms for a specific DAC.
 * @class
 * @implements {UseCase<Map<string, number>>}
 */
@injectable()
export class GetMembersAgreedTermsUseCase
  implements UseCase<Map<string, number>>
{
  public static Token = 'GET_MEMBERS_AGREED_TERMS_USE_CASE';

  /**
   * @constructor
   * @param {TokenWorldsCommon.Services.TokenWorldsContractService} service - The service used to interact with the TokenWorlds contract.
   */
  constructor(
    @inject(TokenWorldsCommon.Services.TokenWorldsContractService.Token)
    private service: TokenWorldsCommon.Services.TokenWorldsContractService
  ) {}

  /**
   * Executes the GetMembersAgreedTermsUseCase to retrieve the agreed terms for members of a specific DAC.
   *
   * @async
   * @public
   * @param {string} dacId - The ID of the DAC to retrieve the agreed terms for its members.
   * @param {string[]} accounts - The array of account addresses of the members.
   * @returns {Promise<Result<Map<string, number>>>} - The result containing the map of account addresses and their corresponding agreed terms versions.
   */
  public async execute(
    dacId: string,
    accounts: string[]
  ): Promise<Result<Map<string, number>>> {
    const list = new Map();

    const { content: rows, failure } = await this.service.fetchMembers({
      scope: dacId.toLowerCase(),
    });
    if (failure) {
      return Result.withFailure(failure);
    }

    for (const account of accounts) {
      const row = rows.find(row => row.sender === account);
      list.set(account, row.agreedtermsversion || 1);
    }

    return Result.withContent(list);
  }
}
