import { Result, log } from '@alien-worlds/aw-core';
import { MongoConfig, MongoSource } from '@alien-worlds/aw-storage-mongodb';

export class MongoHealthTest {
  public static async testConnection(config: MongoConfig): Promise<Result<boolean>> {
    try {
      const mongo = await MongoSource.create(config);
      mongo.client.close();
      return Result.withContent(true);
    } catch (error) {
      log(error)
      return Result.withContent(false);
    }
  }
}
