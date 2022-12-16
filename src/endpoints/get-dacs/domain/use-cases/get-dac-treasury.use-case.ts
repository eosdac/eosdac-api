import { inject, } from 'inversify';
import { injectable, Result, UseCase } from '@alien-worlds/api-core';
import { AlienWorldsAccount, AlienWorldsContractService } from '@alien-worlds/eosdac-api-common';
/*imports*/
/**
 * @class
 */
@injectable()
export class GetDacTreasuryUseCase implements UseCase<AlienWorldsAccount> {
  public static Token = 'GET_DAC_TREASURY_USE_CASE';

  constructor(/*injections*/
    @inject(AlienWorldsContractService.Token)
    private alienWorldsContractService: AlienWorldsContractService
  ) { }

  /**
   * @async
   * @returns {Promise<Result<AlienWorldsAccount>>}
   */
  public async execute(account: string): Promise<Result<AlienWorldsAccount>> {
    const { content: accounts, failure: fetchAccountsFailure } =
      await this.alienWorldsContractService.fetchAccounts({
        scope: account,
        limit: 1,
      })

    if (fetchAccountsFailure) {
      return Result.withFailure(fetchAccountsFailure);
    }

    if (accounts && accounts.length) {
      return Result.withContent(AlienWorldsAccount.fromTableRow(accounts[0]))
    }
  }

  /*methods*/
}

