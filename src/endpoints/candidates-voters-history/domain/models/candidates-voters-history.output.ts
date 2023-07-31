/* eslint-disable sort-imports */
import {
  VotesModel,
  VoteModel,
} from '../../data/dtos/candidates-voters-history.dto';

import { Failure, IO, removeUndefinedProperties } from '@alien-worlds/aw-core';

/**
 * Represents the output for querying candidates' voters history for a specific DAC and candidate.
 * @class
 * @implements {IO}
 */
export class CandidatesVotersHistoryOutput implements IO {
  /**
   * Creates a new instance of CandidatesVotersHistoryOutput.
   *
   * @public
   * @static
   * @param {VoteModel[]} results - The array of vote models.
   * @param {number} total - The total number of records.
   * @param {Failure} failure - The failure object, if any.
   * @returns {CandidatesVotersHistoryOutput} - The created CandidatesVotersHistoryOutput instance.
   */
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
  /**
   * @constructor
   * @param {VoteModel[]} results - The array of vote models.
   * @param {number} total - The total number of records.
   * @param {Failure} failure - The failure object, if any.
   */
  constructor(
    public readonly results: VoteModel[],
    public readonly total: number,
    public readonly failure: Failure
  ) {}

  /**
   * Converts the CandidatesVotersHistoryOutput object to a JSON representation.
   *
   * @public
   * @returns {VotesModel} - The JSON representation of the CandidatesVotersHistoryOutput object.
   */
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
