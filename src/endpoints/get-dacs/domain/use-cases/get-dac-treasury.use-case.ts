import { inject, injectable, Result, UseCase } from '@alien-worlds/api-core';
import { AlienWorldsContract } from '@alien-worlds/dao-api-common';
/*imports*/
/**
 * @class
 */
@injectable()
export class GetDacTreasuryUseCase
  implements UseCase<AlienWorldsContract.Deltas.Entities.Account>
{
  public static Token = 'GET_DAC_TREASURY_USE_CASE';

  constructor(
    /*injections*/
    @inject(AlienWorldsContract.Services.AlienWorldsContractService.Token)
    private alienWorldsContractService: AlienWorldsContract.Services.AlienWorldsContractService
  ) {}

  /**
   * @async
   * @returns {Promise<Result<AlienWorldsContract.Deltas.Entities.Account>>}
   */
  public async execute(
    account: string
  ): Promise<Result<AlienWorldsContract.Deltas.Entities.Account>> {
    const { content: accounts, failure: fetchAccountsFailure } =
      await this.alienWorldsContractService.fetchAccount({
        scope: account,
        limit: 1,
      });

    if (fetchAccountsFailure) {
      return Result.withFailure(fetchAccountsFailure);
    }

    if (accounts && accounts.length) {
      return Result.withContent(
        AlienWorldsContract.Deltas.Entities.Account.fromStruct(accounts[0])
      );
    }
  }

  /*methods*/
}
