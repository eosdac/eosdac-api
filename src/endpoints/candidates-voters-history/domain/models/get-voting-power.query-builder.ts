import { Query, QueryBuilder } from '@alien-worlds/aw-core';

import { MongoDB } from '@alien-worlds/aw-storage-mongodb';

export type GetVotingPowerQueryArgs = { voter: string; voteTimestamp: Date };

/**
 * Represents a query builder for getting the voting power for a specific voter at a given vote timestamp.
 * @class
 * @extends {QueryBuilder}
 */
export class GetVotingPowerQueryBuilder extends QueryBuilder {
  /**
   * Builds the MongoDB filter and options for the query.
   *
   * @public
   * @returns {Query} - The Query object containing the filter and options.
   */
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
