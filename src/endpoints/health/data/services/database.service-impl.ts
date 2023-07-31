import { DatabaseHealthCheckJsonModel } from './../dtos/health.dto';
import { Result } from '@alien-worlds/aw-core';
import ApiConfig from '@src/config/api-config';
import { DatabaseService } from '../../domain/services/database.service';
import { MongoHealthTest } from './mongo.health-test';

export class DatabaseServiceImpl implements DatabaseService {
  constructor(protected config: ApiConfig) {}

  public async checkConnection(): Promise<
    Result<DatabaseHealthCheckJsonModel>
  > {
    const { content: mongoConnected } = await MongoHealthTest.testConnection(
      this.config.mongo
    );

    return Result.withContent({
      mongodb: mongoConnected ? 'OK' : 'FAIL',
    });
  }
}
