import { Result, injectable } from '@alien-worlds/aw-core';
import { DatabaseHealthCheckJsonModel } from '../../data/dtos/health.dto';

@injectable()
export abstract class DatabaseService {
  public static Token = 'DATABASE_SERVICE';

  public abstract checkConnection(): Promise<
    Result<DatabaseHealthCheckJsonModel>
  >;
}
