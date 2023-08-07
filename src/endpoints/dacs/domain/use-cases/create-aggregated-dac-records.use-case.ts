import * as AlienWorldsContract from '@alien-worlds/aw-contract-alien-worlds';
import { inject, injectable, Result, UseCase } from '@alien-worlds/aw-core';
import { Dac } from '../entities/dacs';
import { GetDacTreasuryUseCase } from './get-dac-treasury.use-case';
import { GetDacInfoUseCase } from './get-dac-info.use-case';
import { GetDacTokensUseCase } from './get-dac-tokens.use-case';
import { DacAggregateRecord } from '../models/dac-aggregate-record';

/**
 * The `CreateAggregatedDacRecords` class represents a use case for creating aggregated DAC records.
 * @class
 */
@injectable()
export class CreateAggregatedDacRecords
  implements UseCase<DacAggregateRecord[]>
{
  public static Token = 'CREATE_AGGREGATED_DAC_RECORDS';

  /**
   * Creates an instance of the `CreateAggregatedDacRecords` use case with the specified dependencies.
   * @param {GetDacTreasuryUseCase} getDacTreasuryUseCase - The use case for fetching DAC treasury information.
   * @param {GetDacInfoUseCase} getDacInfoUseCase - The use case for fetching DAC information.
   * @param {GetDacTokensUseCase} getDacTokensUseCase - The use case for fetching DAC tokens information.
   */
  constructor(
    @inject(GetDacTreasuryUseCase.Token)
    private getDacTreasuryUseCase: GetDacTreasuryUseCase,
    @inject(GetDacInfoUseCase.Token)
    private getDacInfoUseCase: GetDacInfoUseCase,
    @inject(GetDacTokensUseCase.Token)
    private getDacTokensUseCase: GetDacTokensUseCase
  ) {}

  /**
   * Executes the use case to create aggregated DAC records for the given DACs.
   * @async
   * @param {Dac[]} dacs - The list of DAC entities.
   * @returns {Promise<Result<DacAggregateRecord[]>>} - The result of the use case operation containing aggregated DAC records.
   */
  public async execute(dacs: Dac[]): Promise<Result<DacAggregateRecord[]>> {
    const list: DacAggregateRecord[] = [];
    for (const dac of dacs) {
      let dacTreasury: AlienWorldsContract.Deltas.Entities.Accounts;

      if (dac.accounts && dac.accounts.auth) {
        const { content, failure: getDacTreasuryFailure } =
          await this.getDacTreasuryUseCase.execute(dac.accounts.auth);
        if (getDacTreasuryFailure) {
          return Result.withFailure(getDacTreasuryFailure);
        }
        dacTreasury = content;
      }

      const { content: dacInfo, failure: getDacInfoFailure } =
        await this.getDacInfoUseCase.execute(dac.dacId);
      if (getDacInfoFailure) {
        return Result.withFailure(getDacInfoFailure);
      }

      const { content: dacTokens, failure: getDacTokensFailure } =
        await this.getDacTokensUseCase.execute(dac.symbol.symbol.code);
      if (getDacTokensFailure) {
        return Result.withFailure(getDacTokensFailure);
      }

      list.push(
        DacAggregateRecord.create(dac, dacTreasury, dacInfo[0], dacTokens[0])
      );
    }

    return Result.withContent(list);
  }
}
