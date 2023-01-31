import { Filter, FindOptions, MongoFindQueryParams, QueryModel } from '@alien-worlds/api-core';

import { ActionDocument } from '@alien-worlds/eosdac-api-common';
import { CandidatesVotersHistoryInput } from './candidates-voters-history.input';
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

  public toQueryParams(): MongoFindQueryParams<ActionDocument> {
    const { dacId, candidateId } = this;

    const filter: Filter<ActionDocument> = {
      'action.account': 'dao.worlds',
      'action.name': 'votecust',
      'action.data.dac_id': dacId,
      'action.data.newvotes': candidateId
    };

    const options: FindOptions = {};

    return { filter, options };
  }
}

