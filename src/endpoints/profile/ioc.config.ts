import * as DaoWorldsCommon from '@alien-worlds/dao-worlds-common';

import { Container, RepositoryImpl } from '@alien-worlds/api-core';
import { MongoConfig, MongoSource } from '@alien-worlds/storage-mongodb';

import { FlagMongoSource } from './data/data-sources/flag.mongo.source';
import { FlagRepository } from './domain/repositories/flag.repository';

export const setupFlagRepository = async (
  mongo: MongoSource | MongoConfig,
  container?: Container
): Promise<FlagRepository> => {
  let mongoSource: MongoSource;
  if (mongo instanceof MongoSource) {
    mongoSource = mongo;
  } else {
    mongoSource = await MongoSource.create(mongo);
  }

  const repository = new RepositoryImpl(
    new FlagMongoSource(mongoSource),
    new DaoWorldsCommon.Actions.Mappers.FlagcandprofMongoMapper(),
    null
  );

  if (container) {
    container
      .bind<FlagRepository>(FlagRepository.Token)
      .toConstantValue(repository);
  }

  return repository;
};
