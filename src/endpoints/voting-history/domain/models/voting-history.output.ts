import {
  Failure,
  IO,
  Result,
  UnknownObject,
  removeUndefinedProperties,
} from '@alien-worlds/aw-core';
import { UserVote } from '../../domain/entities/user-vote';
import { VotingHistoryOutputItem } from '../../data/dtos/user-voting-history.dto';

/**
 * Represents the output data for the voting history query.
 *
 * @class
 * @implements {IO}
 */
export class VotingHistoryOutput implements IO {
  /**
   * Creates a new instance of VotingHistoryOutput.
   *
   * @method
   * @static
   * @param {Result<UserVote[]>} result - The result of the voting history query.
   * @returns {VotingHistoryOutput} The newly created VotingHistoryOutput instance.
   */
  public static create(result: Result<UserVote[]>): VotingHistoryOutput {
    const { content, failure } = result;
    return new VotingHistoryOutput(content, content?.length || 0, failure);
  }

  /**
   * Creates a new instance of VotingHistoryOutput.
   *
   * @method
   * @private
   * @constructor
   * @param {UserVote[]} results - The array of UserVote instances representing the voting history.
   * @param {number} count - The count of voting history items.
   * @param {Failure} failure - The failure object if the query was not successful.
   */
  private constructor(
    public readonly results: UserVote[],
    public readonly count: number,
    public readonly failure: Failure
  ) {}

  /**
   * Converts the VotingHistoryOutput instance to a JSON representation.
   *
   * @method
   * @returns {UnknownObject} The JSON representation of the VotingHistoryOutput instance.
   */
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
