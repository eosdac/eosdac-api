import { MongoDB, MongoFindQueryParams, QueryModel } from '@alien-worlds/api-core';

import { CandidatesVotersHistoryInput } from './candidates-voters-history.input';
import { DaoWorldsContract } from '@alien-worlds/eosdac-api-common';

/*imports*/

/**
 * @class
 */
export class CountVotersHistoryQueryModel extends QueryModel {
  /**
   * @returns {CountVotersHistoryQueryModel}
   */
  public static create(model: CandidatesVotersHistoryInput): CountVotersHistoryQueryModel {
    const { dacId, candidateId } = model;
    return new CountVotersHistoryQueryModel(dacId, candidateId);
  }

  /**
   * @constructor
   * @private
   */
  private constructor(
    public readonly dacId: string,
    public readonly candidateId: string,
  ) {
    super();
  }

  public toQueryParams(): MongoFindQueryParams<DaoWorldsContract.Actions.Types.VotecustDocument> {
    const { dacId, candidateId } = this;

    const filter: MongoDB.Filter<DaoWorldsContract.Actions.Types.VotecustDocument> = {
      'action.account': 'dao.worlds',
      'action.name': 'votecust',
      'action.data.dac_id': dacId,
      'action.data.newvotes': candidateId
    };

    const options: MongoDB.FindOptions = {};

    return { filter, options };
  }
}

