import { MongoDB, MongoFindQueryParams, QueryModel } from '@alien-worlds/api-core';

/*imports*/

/**
 * @class
 */
export class GetVotingPowerQueryModel extends QueryModel {
  /**
   * @returns {GetVotingPowerQueryModel}
   */
  public static create(voter: string, voteTimestamp: Date): GetVotingPowerQueryModel {
    return new GetVotingPowerQueryModel(voter, voteTimestamp);
  }

  /**
   * @constructor
   * @private
   */
  private constructor(
    public readonly voter: string,
    public readonly voteTimestamp: Date,
  ) {
    super();
  }

  public toQueryParams(): MongoFindQueryParams<unknown> {
    const { voter, voteTimestamp } = this;

    const filter: MongoDB.Filter<unknown> = {
      code: "stkvt.worlds",
      table: "weights",
      "data.voter": voter,
      "block_timestamp": { $lt: voteTimestamp }
    };
    const options: MongoDB.FindOptions = {
      sort: { "block_timestamp": -1 },
      limit: 1,
    };

    return { filter, options };
  }
}

