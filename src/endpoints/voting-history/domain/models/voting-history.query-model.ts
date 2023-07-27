import { Query, QueryBuilder } from '@alien-worlds/aw-core';

import { MongoDB } from '@alien-worlds/aw-storage-mongodb';
import { UserVotingHistoryMongoModel } from '../../data/dtos/user-voting-history.dto';

export type VotingHistoryQueryArgs = {
  dacId: string;
  voter: string;
  skip: number;
  limit: number;
};

/**
 * @class
 */
export class VotingHistoryQueryBuilder extends QueryBuilder {
  public build(): Query {
    const { dacId, voter, skip, limit } = this.args as VotingHistoryQueryArgs;

    const filter: MongoDB.Filter<UserVotingHistoryMongoModel> = {
      'action.account': 'dao.worlds',
      'action.name': 'votecust',
      'action.data.dac_id': dacId,
      'action.data.voter': voter,
    };

    const options: MongoDB.FindOptions = {
      skip: skip || 0,
      limit: limit || Number.MAX_VALUE,
      sort: { block_num: 1 },
    };

    return { filter, options };
  }
}
