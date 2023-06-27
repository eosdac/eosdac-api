import * as AlienWorldsCommon from '@alien-worlds/alien-worlds-common';
import { inject, injectable, Result, UseCase } from '@alien-worlds/api-core';

/**
 * @class
 */
@injectable()
export class GetDacTreasuryUseCase
  implements UseCase<AlienWorldsCommon.Deltas.Entities.Accounts>
{
  public static Token = 'GET_DAC_TREASURY_USE_CASE';

  constructor(
    @inject(AlienWorldsCommon.Services.AlienWorldsContractService.Token)
    private alienWorldsContractService: AlienWorldsCommon.Services.AlienWorldsContractService
  ) {}

  /**
   * @async
   * @returns {Promise<Result<AlienWorldsCommon.Deltas.Entities.Accounts>>}
   */
  public async execute(
    account: string
  ): Promise<Result<AlienWorldsCommon.Deltas.Entities.Accounts>> {
    const { content: accounts, failure: fetchAccountsFailure } =
      await this.alienWorldsContractService.fetchAccounts({
        scope: account,
        limit: 1,
      });

    if (fetchAccountsFailure) {
      return Result.withFailure(fetchAccountsFailure);
    }

    if (accounts && accounts.length) {
      return Result.withContent(
        new AlienWorldsCommon.Deltas.Mappers.AccountsRawMapper().toEntity(
          accounts[0]
        )
      );
    }
  }
}
