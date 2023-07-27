import { Query, QueryBuilder } from '@alien-worlds/aw-core';

import { MongoDB } from '@alien-worlds/aw-storage-mongodb';

export type CandidatesVotersHistoryQueryArgs = {
  dacId: string;
  candidateId: string;
};

/**
 * @class
 */
export class CandidatesVotersHistoryQueryBuilder extends QueryBuilder {
  public build(): Query {
    const { candidateId, dacId } = this
      .args as CandidatesVotersHistoryQueryArgs;

    const pipeline: object[] = [
      {
        $match: {
          'action.account': 'dao.worlds',
          'action.name': 'votecust',
          'action.data.dac_id': dacId,
          'action.data.newvotes': candidateId,
        },
      },
      {
        $sort: {
          block_num: 1,
        },
      },
    ];

    const options: MongoDB.AggregateOptions = {};

    return { pipeline, options };
  }
}
