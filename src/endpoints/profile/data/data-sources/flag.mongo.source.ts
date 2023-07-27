import * as DaoWorldsCommon from '@alien-worlds/aw-contract-dao-worlds';

import {
  MongoCollectionSource,
  MongoSource,
} from '@alien-worlds/aw-storage-mongodb';

/**
 * NFTs data source from the mongo database
 * @class
 */
export class FlagMongoSource extends MongoCollectionSource<DaoWorldsCommon.Actions.Types.FlagcandprofMongoModel> {
  public static Token = 'FLAG_MONGO_SOURCE';

  /**
   * @constructor
   * @param {MongoSource} mongoSource
   */
  constructor(mongoSource: MongoSource) {
    super(mongoSource, 'flags');
  }
}
