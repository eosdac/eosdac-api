/* eslint-disable sort-imports */
import {
  VotesModel,
  VoteModel,
} from '../../data/dtos/candidates-voters-history.dto';

import { Failure, IO, removeUndefinedProperties } from '@alien-worlds/aw-core';

export class CandidatesVotersHistoryOutput implements IO {
  public static create(
    results: VoteModel[],
    total: number,
    failure?: Failure
  ): CandidatesVotersHistoryOutput {
    return new CandidatesVotersHistoryOutput(
      results || [],
      total || 0,
      failure
    );
  }

  constructor(
    public readonly results: VoteModel[],
    public readonly total: number,
    public readonly failure: Failure
  ) {}

  public toJSON(): VotesModel {
    const { results, total, failure } = this;

    if (failure) {
      return { results: [], total: 0 };
    }

    const result = {
      results: results.map(item => {
        const {
          voter,
          votingPower,
          action,
          candidate,
          voteTimestamp,
          transactionId,
        } = item;

        return removeUndefinedProperties<VoteModel>({
          voter,
          votingPower: votingPower.toString(),
          action,
          candidate,
          voteTimestamp,
          transactionId,
        });
      }),
      total,
    };

    return removeUndefinedProperties<VotesModel>(result);
  }
}
