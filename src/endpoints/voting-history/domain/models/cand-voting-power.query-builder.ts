import { Query, QueryBuilder } from '@alien-worlds/aw-core';

import { MongoDB } from '@alien-worlds/aw-storage-mongodb';
import { UserVotingHistoryMongoModel } from '../../data/dtos/user-voting-history.dto';

export type CandidateVotingPowerQueryArgs = {
  dacId: string;
  candidateName: string;
  block_timestamp: Date;
};

/**
 * @class
 */
export class CandidateVotingPowerQueryBuilder extends QueryBuilder {
  public build(): Query {
    const { dacId, candidateName, block_timestamp } = this
      .args as CandidateVotingPowerQueryArgs;

    const filter: MongoDB.Filter<UserVotingHistoryMongoModel> = {
      code: 'dao.worlds',
      scope: dacId,
      table: 'candidates',
      'data.candidate_name': candidateName,
      block_timestamp: {
        $lt: block_timestamp,
      },
    };

    const options: MongoDB.FindOptions = {
      sort: { block_timestamp: -1 },
    };

    return { filter, options };
  }
}
