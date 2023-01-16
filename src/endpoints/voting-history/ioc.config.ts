import {
  connectMongo,
  MongoConfig,
  MongoSource,
} from '@alien-worlds/api-core';

import { Container } from 'inversify';
import { UserVotingHistoryMapper } from './data/mappers/user-voting-history.mapper';
import { UserVotingHistoryMongoSource } from './data/data-sources/user-voting-history.mongo.source';
import { UserVotingHistoryRepository } from './domain/repositories/user-voting-history.repository';
import { UserVotingHistoryRepositoryImpl } from './data/repositories/user-voting-history.repository-impl';

export const setupUserVotingHistoryRepository = async (
  mongo: MongoSource | MongoConfig,
  container?: Container
) => {
  let mongoSource: MongoSource;
  if (mongo instanceof MongoSource) {
    mongoSource = mongo;
  } else {
    const db = await connectMongo(mongo);
    mongoSource = new MongoSource(db);
  }
  const voterMongoSource = new UserVotingHistoryMongoSource(mongoSource);
  const mapper = new UserVotingHistoryMapper();
  const repository = new UserVotingHistoryRepositoryImpl(voterMongoSource, mapper, mongoSource);

  if (container) {
    container
      .bind<UserVotingHistoryRepository>(UserVotingHistoryRepository.Token)
      .toConstantValue(repository);
  }

  return repository;
};
