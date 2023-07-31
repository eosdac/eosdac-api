import * as AlienWorldsContract from '@alien-worlds/aw-contract-alien-worlds';
import { inject, injectable, Result, UseCase } from '@alien-worlds/aw-core';
import { Dac } from '../entities/dacs';
import { GetDacTreasuryUseCase } from './get-dac-treasury.use-case';
import { GetDacInfoUseCase } from './get-dac-info.use-case';
import { GetDacTokensUseCase } from './get-dac-tokens.use-case';
import { DacAggregateRecord } from '../models/dac-aggregate-record.ts';

/**
 * @class
 */
@injectable()
export class CreateAggregatedDacRecords
  implements UseCase<DacAggregateRecord[]>
{
  public static Token = 'CREATE_AGGREGATED_DAC_RECORDS';

  constructor(
    @inject(GetDacTreasuryUseCase.Token)
    private getDacTreasuryUseCase: GetDacTreasuryUseCase,
    @inject(GetDacInfoUseCase.Token)
    private getDacInfoUseCase: GetDacInfoUseCase,
    @inject(GetDacTokensUseCase.Token)
    private getDacTokensUseCase: GetDacTokensUseCase
  ) {}

  /**
   * @async
   * @returns {Promise<Result<DacAggregateRecord[]>>}
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
