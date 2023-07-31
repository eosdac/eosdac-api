import { Result } from '@alien-worlds/aw-core';
import { HistoryService } from '../../domain/services/history.service';
import ApiConfig from '@src/config/api-config';
import { BlockStateJsonModel } from '../dtos/health.dto';

export class HistoryServiceImpl implements HistoryService {
  constructor(protected config: ApiConfig) {}

  public async getCurrentBlockNumber(): Promise<Result<bigint>> {
    let currentBlock = -1n;

    try {
      const apiResp = await fetch(`${this.config.historyApi.host}/block-state`);

      if (apiResp.ok) {
        const responseJson: BlockStateJsonModel = await apiResp.json();
        currentBlock = responseJson.currentBlockNumber;
      } else {
        throw new Error(apiResp.statusText);
      }
    } catch (error) {
      return Result.withFailure(
        `unable to fetch current block. ${error.message}`
      );
    }

    return Result.withContent(currentBlock);
  }
}
