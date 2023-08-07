import * as DaoWorldsCommon from '@alien-worlds/aw-contract-dao-worlds';
import { Query, QueryBuilder } from '@alien-worlds/aw-core';
import { MongoDB } from '@alien-worlds/aw-storage-mongodb';

export type CountVotersHitoryQueryArgs = { dacId: string; candidateId: string };

/**
 * Represents a query builder for counting voters' history for a specific DAC and candidate.
 * @class
 * @extends {QueryBuilder}
 */
export class CountVotersHistoryQueryBuilder extends QueryBuilder {
  /**
   * Builds the MongoDB filter and options for the query.
   *
   * @public
   * @returns {Query} - The Query object containing the filter and options.
   */
  public build(): Query {
    const { dacId, candidateId } = this.args as CountVotersHitoryQueryArgs;

    const filter: MongoDB.Filter<DaoWorldsCommon.Actions.Types.VotecustMongoModel> =
      {
        'action.account': 'dao.worlds',
        'action.name': 'votecust',
        'action.data.dac_id': dacId,
        'action.data.newvotes': candidateId,
      };

    const options: MongoDB.FindOptions = {};

    return { filter, options };
  }
}
