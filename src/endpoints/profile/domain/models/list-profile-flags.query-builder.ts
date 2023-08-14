import { Query, QueryBuilder } from '@alien-worlds/aw-core';

import { MongoDB } from '@alien-worlds/aw-storage-mongodb';

type Args = {
  dacId: string;
  accounts: string[];
};

/**
 * @class
 */
export class ListProfileFlagsQueryBuilder extends QueryBuilder {
  public build(): Query {
    const { dacId, accounts } = this.args as Args;

    const pipeline: object[] = [
      { $match: { dac_id: dacId, cand: { $in: accounts } } },
      { $sort: { block_number: -1 } },
      {
        $group: {
          _id: { cand: '$cand' },
          block: { $first: '$block' },
          cand: { $first: '$cand' },
        },
      },
    ];

    const options: MongoDB.AggregateOptions = {};

    return { pipeline, options };
  }
}
