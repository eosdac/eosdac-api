import { Container, MongoConfig, MongoSource } from '@alien-worlds/api-core';

import { StateMapper } from './data/mappers/state.mapper';
import { StateMongoSource } from './data/data-sources/state.mongo.source';
import { StateRepository } from './domain/repositories/state.repository';
import { StateRepositoryImpl } from './data/repositories/state.repository-impl';

export const setupStateRepository = async (
  mongo: MongoSource | MongoConfig,
  container?: Container
) => {
  let mongoSource: MongoSource;
  if (mongo instanceof MongoSource) {
    mongoSource = mongo;
  } else {
    mongoSource = await MongoSource.create(mongo);
  }
  const stateMongoSource = new StateMongoSource(mongoSource);
  const mapper = new StateMapper();
  const repository = new StateRepositoryImpl(stateMongoSource, mapper);

  if (container) {
    container
      .bind<StateRepository>(StateRepository.Token)
      .toConstantValue(repository);
  }

  return repository;
};
