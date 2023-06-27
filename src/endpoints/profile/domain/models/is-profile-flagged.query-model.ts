import { Query, QueryBuilder } from '@alien-worlds/api-core';

import { MongoDB } from '@alien-worlds/storage-mongodb';

export type IsProfileFlaggedQueryArgs = {
  dacId: string;
  accounts: string[];
};

/**
 * @class
 */
export class IsProfileFlaggedQueryBuilder extends QueryBuilder {
  public build(): Query {
    const { dacId, accounts } = this.args as IsProfileFlaggedQueryArgs;

    const pipeline: object[] = [
      { $match: { dac_id: dacId, cand: { $in: accounts } } },
      { $sort: { block_num: -1 } },
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
