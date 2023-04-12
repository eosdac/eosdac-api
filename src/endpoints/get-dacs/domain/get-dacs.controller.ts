import { inject, injectable, Result } from '@alien-worlds/api-core';
import { AlienWorldsContract } from '@alien-worlds/dao-api-common';

import { GetAllDacsUseCase } from './use-cases/get-all-dacs.use-case';
import { GetDacInfoUseCase } from './use-cases/get-dac-info.use-case';
import { GetDacOutput } from './models/get-dac.output';
import { GetDacsInput } from './models/dacs.input';
import { GetDacTokensUseCase } from './use-cases/get-dac-tokens.use-case';
import { GetDacTreasuryUseCase } from './use-cases/get-dac-treasury.use-case';

/*imports*/

/**
 * @class
 *
 *
 */
@injectable()
export class GetDacsController {
  public static Token = 'GET_DACS_CONTROLLER';

  constructor(
    /*injections*/
    @inject(GetAllDacsUseCase.Token)
    private getAllDacsUseCase: GetAllDacsUseCase,
    @inject(GetDacTreasuryUseCase.Token)
    private getDacTreasuryUseCase: GetDacTreasuryUseCase,
    @inject(GetDacInfoUseCase.Token)
    private getDacInfoUseCase: GetDacInfoUseCase,
    @inject(GetDacTokensUseCase.Token)
    private getDacTokensUseCase: GetDacTokensUseCase
  ) {}

  /*methods*/

  /**
   *
   * @returns {Promise<Result<GetDacOutput[]>>}
   */
  public async dacs(input: GetDacsInput): Promise<Result<GetDacOutput[]>> {
    const output: GetDacOutput[] = [];
    const { content: dacs, failure: getAllDacsFailure } =
      await this.getAllDacsUseCase.execute(input);

    if (getAllDacsFailure) {
      return Result.withFailure(getAllDacsFailure);
    }

    for (const dac of dacs) {
      let dacTreasury: AlienWorldsContract.Deltas.Entities.Account;

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
        await this.getDacTokensUseCase.execute(dac.symbol.code);
      if (getDacTokensFailure) {
        return Result.withFailure(getDacTokensFailure);
      }

      output.push(
        GetDacOutput.create(dac, dacTreasury, dacInfo[0], dacTokens[0])
      );
    }

    return Result.withContent(output);
  }
}
