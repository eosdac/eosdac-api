import { MongoDB, MongoSource } from '@alien-worlds/storage-mongodb';

import { FlagMongoSource } from '../flag.mongo.source';

const db = {
  databaseName: 'TestDB',
  collection: jest.fn(() => ({
    findOne: jest.fn(),
  })) as any,
};

const mongoSource = new MongoSource(db as MongoDB.Db);

describe('FlagMongoSource', () => {
  const flagMongoSource: FlagMongoSource = new FlagMongoSource(mongoSource);

  it('"Token" should be set', () => {
    expect(FlagMongoSource.Token).not.toBeNull();
  });

  it('should create a new instance of FlagMongoSource', () => {
    expect(flagMongoSource).toBeInstanceOf(FlagMongoSource);
  });
});
