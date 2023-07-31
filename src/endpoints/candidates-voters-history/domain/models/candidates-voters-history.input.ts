import { IO, UnknownObject } from '@alien-worlds/aw-core';

/**
 * @class
 */
export class CandidatesVotersHistoryInput implements IO {
  /**
   *
   * @constructor
   * @param {string} dacId
   * @param {string} candidateId
   * @param {number} skip
   * @param {number} limit
   */
  constructor(
    public readonly dacId: string,
    public readonly candidateId: string,
    public readonly skip: number,
    public readonly limit: number
  ) {}

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
