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
      { $sort: { block_num: -1 } },
      {
        $group: {
          _id: '$action.data.cand',
          block_num: { $first: '$block_num' },
          profile: { $first: '$action.data.profile' },
          account: { $first: '$action.data.cand' },
          action: { $first: '$action' },
          recv_sequence: { $first: '$recv_sequence' },
          global_sequence: { $first: '$global_sequence' },
        },
      },
      { $sort: { block_num: -1 } },
    ];

    const options: MongoDB.AggregateOptions = {};

    return { pipeline, options };
  }
}
