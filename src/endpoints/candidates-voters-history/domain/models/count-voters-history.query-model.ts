import * as DaoWorldsCommon from '@alien-worlds/aw-contract-dao-worlds';

import { Query, QueryBuilder } from '@alien-worlds/aw-core';

import { MongoDB } from '@alien-worlds/aw-storage-mongodb';

export type CountVotersHitoryQueryArgs = { dacId: string; candidateId: string };

/**
 * @class
 */
export class CountVotersHistoryQueryBuilder extends QueryBuilder {
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
