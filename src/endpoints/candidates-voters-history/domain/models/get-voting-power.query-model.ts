import { Query, QueryBuilder } from '@alien-worlds/aw-core';

import { MongoDB } from '@alien-worlds/aw-storage-mongodb';

export type GetVotingPowerQueryArgs = { voter: string; voteTimestamp: Date };

/**
 * @class
 */
export class GetVotingPowerQueryBuilder extends QueryBuilder {
  public build(): Query {
    const { voter, voteTimestamp } = this.args as GetVotingPowerQueryArgs;

    const filter: MongoDB.Filter<unknown> = {
      code: 'stkvt.worlds',
      table: 'weights',
      'data.voter': voter,
      block_timestamp: { $lt: voteTimestamp },
    };
    const options: MongoDB.FindOptions = {
      sort: { block_timestamp: -1 },
      limit: 1,
    };

    return { filter, options };
  }
}
