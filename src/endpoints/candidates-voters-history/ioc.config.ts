import { Container, MongoConfig, MongoSource } from '@alien-worlds/api-core';

import { VotingWeightMapper } from './data/mappers/voting-weight.mapper';
import { VotingWeightMongoSource } from './data/data-sources/voting-weight.mongo.source';
import { VotingWeightRepository } from './domain/repositories/voting-weight.repository';
import { VotingWeightRepositoryImpl } from './data/repositories/voting-weight.repository-impl';

export const setupVotingWeightRepository = async (
  mongo: MongoSource | MongoConfig,
  container?: Container
) => {
  let mongoSource: MongoSource;
  if (mongo instanceof MongoSource) {
    mongoSource = mongo;
  } else {
    mongoSource = await MongoSource.create(mongo);
  }
  const voterMongoSource = new VotingWeightMongoSource(mongoSource);
  const mapper = new VotingWeightMapper();
  const repository = new VotingWeightRepositoryImpl(
    voterMongoSource,
    mapper,
    mongoSource
  );

  if (container) {
    container
      .bind<VotingWeightRepository>(VotingWeightRepository.Token)
      .toConstantValue(repository);
  }

  return repository;
};
