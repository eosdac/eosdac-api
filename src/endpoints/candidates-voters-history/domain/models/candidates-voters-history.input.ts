import { IO, UnknownObject } from '@alien-worlds/aw-core';

/**
 * Represents the input for querying candidates' voters history for a specific DAC and candidate.
 * @class
 * @implements {IO}
 */
export class CandidatesVotersHistoryInput implements IO {
  /**
   * @constructor
   * @public
   * @param {string} dacId - The ID of the DAC.
   * @param {string} candidateId - The ID of the candidate.
   * @param {number} skip - The number of records to skip (used for pagination).
   * @param {number} limit - The maximum number of records to return per query (used for pagination).
   */
  constructor(
    public readonly dacId: string,
    public readonly candidateId: string,
    public readonly skip: number,
    public readonly limit: number
  ) {}

  /**
   * Converts the CandidatesVotersHistoryInput object to a JSON representation.
   *
   * @public
   * @returns {UnknownObject} - The JSON representation of the CandidatesVotersHistoryInput object.
   */
  public toJSON(): UnknownObject {
    const { dacId, candidateId, skip, limit } = this;

    return {
      dacId,
      candidateId,
      skip,
      limit,
    };
  }
}
