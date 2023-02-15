import { MongoAggregateParams, MongoDB, QueryModel } from '@alien-worlds/api-core';

import { IsProfileFlaggedUseCaseInput } from '../../data/dtos/profile.dto';

/*imports*/

/**
 * @class
 */
export class IsProfileFlaggedQueryModel extends QueryModel {
  /**
   * @returns {IsProfileFlaggedQueryModel}
   */
  public static create(model: IsProfileFlaggedUseCaseInput): IsProfileFlaggedQueryModel {
    const { dacId, accounts } = model;
    return new IsProfileFlaggedQueryModel(dacId, accounts);
  }

  /**
   * @constructor
   * @private
   */
  private constructor(
    public readonly dacId: string,
    public readonly accounts: string[],
  ) {
    super();
  }

  public toQueryParams(): MongoAggregateParams {
    const { dacId, accounts } = this;

    const pipeline: object[] = [
      { $match: { dac_id: dacId, cand: { $in: accounts } } },
      { $sort: { "block_num": -1 } },
      {
        $group: {
          _id: { cand: "$cand" },
          block: { $first: "$block" },
          cand: { $first: "$cand" }
        }
      },
    ];

    const options: MongoDB.AggregateOptions = {};

    return { pipeline, options };
  }
}
