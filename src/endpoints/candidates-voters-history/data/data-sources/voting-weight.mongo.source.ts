import { CollectionMongoSource, MongoSource } from '@alien-worlds/api-core';

import { VoteWeightDocument } from '../dtos/weights.dto';

/**
 * NFTs data source from the mongo database
 * @class
 */
export class VotingWeightMongoSource extends CollectionMongoSource<VoteWeightDocument> {
  /**
   * @constructor
   * @param {MongoSource} mongoSource
   */
  constructor(mongoSource: MongoSource) {
    super(mongoSource, 'user_voting_history');
  }
}
