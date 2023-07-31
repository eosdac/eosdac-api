/* eslint-disable sort-imports */
import { IO, Result, UnknownObject } from '@alien-worlds/aw-core';
import { CandidateProfile } from './../entities/candidate-profile';
/**
 * Represents the output data for getting candidates.
 * @class
 * @implements {IO<UnknownObject[]>}
 */
export class GetCandidatesOutput implements IO<UnknownObject[]> {
  /**
   * Creates a new instance of GetCandidatesOutput with the provided Result of CandidateProfile array.
   *
   * @static
   * @public
   * @param {Result<CandidateProfile[]>} result - The result containing the array of CandidateProfile objects.
   * @returns {GetCandidatesOutput} - The created GetCandidatesOutput instance.
   */
  public static create(result: Result<CandidateProfile[]>) {
    return new GetCandidatesOutput(result);
  }

  /**
   * @constructor
   * @public
   * @param {Result<CandidateProfile[]>} result - The result containing the array of CandidateProfile objects.
   */
  constructor(public readonly result: Result<CandidateProfile[]>) {}

  /**
   * Converts the GetCandidatesOutput object to an array of plain objects.
   *
   * @public
   * @returns {UnknownObject[]} - The array of plain objects representing the CandidateProfile objects.
   */
  public toJSON(): UnknownObject[] {
    const { result } = this;

    if (result.isFailure) {
      return [];
    }

    return result.content.map(profile => profile.toJSON());
  }
}
