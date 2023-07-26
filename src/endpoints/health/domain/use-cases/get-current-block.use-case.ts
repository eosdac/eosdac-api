import { Failure, injectable, Result, UseCase } from '@alien-worlds/api-core';

import { BlockStateJsonModel } from '@endpoints/health/data/dtos/health.dto';
import { config } from '@config';
import fetch from 'node-fetch';

/**
 * @class
 */
@injectable()
export class GetCurrentBlockUseCase implements UseCase<bigint> {
  public static Token = 'GET_CURRENT_BLOCK_USE_CASE';

  /**
   * @async
   * @returns {Promise<Result<bigint>>}
   */
  public async execute(): Promise<Result<bigint>> {
    let currentBlock = -1n;

    try {
      const apiResp = await fetch(`${config.historyApi.host}/block-state`);

      if (apiResp.ok) {
        const responseJson: BlockStateJsonModel = await apiResp.json();
        currentBlock = responseJson.currentBlockNumber;
      } else {
        throw new Error(apiResp.statusText);
      }
    } catch (error) {
      return Result.withFailure(
        Failure.withMessage(`unable to fetch current block. ${error.message}`)
      );
    }

    return Result.withContent(currentBlock);
  }
}
