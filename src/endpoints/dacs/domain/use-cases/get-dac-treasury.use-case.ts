import * as AlienWorldsCommon from '@alien-worlds/aw-contract-alien-worlds';
import { inject, injectable, Result, UseCase } from '@alien-worlds/aw-core';

/**
 * The `GetDacTreasuryUseCase` class represents a use case for fetching DAC treasury information from the Alien Worlds smart contract.
 * @class
 */
@injectable()
export class GetDacTreasuryUseCase
  implements UseCase<AlienWorldsCommon.Deltas.Entities.Accounts>
{
  public static Token = 'GET_DAC_TREASURY_USE_CASE';

  /**
   * Creates an instance of the `GetDacTreasuryUseCase` use case with the specified dependencies.
   * @param {AlienWorldsCommon.Services.AlienWorldsContractService} alienWorldsContractService - The service for interacting with the Alien Worlds smart contract.
   */
  constructor(
    @inject(AlienWorldsCommon.Services.AlienWorldsContractService.Token)
    private alienWorldsContractService: AlienWorldsCommon.Services.AlienWorldsContractService
  ) {}

  /**
   * Executes the use case to fetch DAC treasury information from the Alien Worlds smart contract.
   * @async
   * @param {string} account - The account name of the DAC treasury for which to fetch the information.
   * @returns {Promise<Result<AlienWorldsCommon.Deltas.Entities.Accounts>>} - The result of the use case operation containing the fetched DAC treasury information.
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
