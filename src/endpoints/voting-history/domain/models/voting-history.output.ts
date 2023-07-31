import {
  Failure,
  IO,
  Result,
  UnknownObject,
  removeUndefinedProperties,
} from '@alien-worlds/aw-core';
import { UserVote } from '../../domain/entities/user-vote';
import { VotingHistoryOutputItem } from '../../data/dtos/user-voting-history.dto';

export class VotingHistoryOutput implements IO {
  public static create(result: Result<UserVote[]>): VotingHistoryOutput {
    const { content, failure } = result;
    return new VotingHistoryOutput(content, content?.length || 0, failure);
  }

  private constructor(
    public readonly results: UserVote[],
    public readonly count: number,
    public readonly failure: Failure
  ) {}

  public toJSON(): UnknownObject {
    const { failure, results, count } = this;

    if (failure) {
      return {
        results: [],
        count: 0,
      };
    }

    const result = {
      results: results.map(vote => {
        const {
          dacId,
          voter,
          voteTimestamp,
          candidate,
          candidateVotePower,
          action,
        } = vote;

        const dto = {
          dacId,
          voter,
          voteTimestamp,
          candidate,
          candidateVotePower: candidateVotePower.toString(),
          action,
        };

        return removeUndefinedProperties<VotingHistoryOutputItem>(dto);
      }),
      count,
    };

    return removeUndefinedProperties(result);
  }
}
