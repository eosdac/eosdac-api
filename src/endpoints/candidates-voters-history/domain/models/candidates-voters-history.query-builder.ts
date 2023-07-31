import { Query, QueryBuilder } from '@alien-worlds/aw-core';

import { MongoDB } from '@alien-worlds/aw-storage-mongodb';

export type CandidatesVotersHistoryQueryArgs = {
  dacId: string;
  candidateId: string;
};

/**
 * Represents a query builder for querying candidates' voters history for a specific DAC and candidate.
 * @class
 * @extends {QueryBuilder}
 */
export class CandidatesVotersHistoryQueryBuilder extends QueryBuilder {
  /**
   * Builds the MongoDB aggregation pipeline and options for the query.
   *
   * @public
   * @returns {Query} - The Query object containing the pipeline and options.
   */
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
