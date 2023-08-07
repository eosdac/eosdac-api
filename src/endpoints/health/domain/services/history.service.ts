import { Result, injectable } from '@alien-worlds/aw-core';

@injectable()
export abstract class HistoryService {
  public static Token = 'HISTORY_SERVICE';

  public abstract getCurrentBlockNumber(): Promise<Result<bigint>>;
}
