import * as TokenWorldsCommon from '@alien-worlds/aw-contract-token-worlds';
import { inject, injectable, Result, UseCase } from '@alien-worlds/aw-core';

/**
 * @class
 */
@injectable()
export class GetMembersAgreedTermsUseCase
  implements UseCase<Map<string, number>>
{
  public static Token = 'GET_MEMBERS_AGREED_TERMS_USE_CASE';

  constructor(
    @inject(TokenWorldsCommon.Services.TokenWorldsContractService.Token)
    private service: TokenWorldsCommon.Services.TokenWorldsContractService
  ) {}

  /**
   * @async
   * @returns {Promise<Result<Map<string, number>>>}
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
