import { Query, QueryBuilder } from '@alien-worlds/aw-core';

import { MongoDB } from '@alien-worlds/aw-storage-mongodb';

type ProfileQueryArgs = {
  custContract: string;
  dacId: string;
  accounts: string[];
};

/**
 * @class
 */
export class ListProfileActionsQueryBuilder extends QueryBuilder {
  public build(): Query {
    const { dacId, accounts } = this.args as ProfileQueryArgs;

    const pipeline: object[] = [
      {
        $match: {
          'action.name': 'stprofile',
          'action.data.dac_id': dacId,
          'action.data.cand': { $in: accounts },
        },
      },
      { $sort: { block_number: -1 } },
      {
        $group: {
          _id: '$action.data.cand',
          block_number: { $first: '$block_number' },
          profile: { $first: '$action.data.profile' },
          account: { $first: '$action.data.cand' },
          action: { $first: '$action' },
          receiver_sequence: { $first: '$receiver_sequence' },
          global_sequence: { $first: '$global_sequence' },
        },
      },
      { $sort: { block_number: -1 } },
    ];

    const options: MongoDB.AggregateOptions = {};

    return { pipeline, options };
  }
}
