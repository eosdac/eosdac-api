import { CollectionMongoSource, MongoSource } from '@alien-worlds/api-core';

import { UserVotingHistoryDocument } from '../dtos/user-voting-history.dto';

/**
 * NFTs data source from the mongo database
 * @class
 */
export class UserVotingHistoryMongoSource extends CollectionMongoSource<UserVotingHistoryDocument> {
  /**
   * @constructor
   * @param {MongoSource} mongoSource
   */
  constructor(mongoSource: MongoSource) {
    super(mongoSource, 'user_voting_history');
  }
}
