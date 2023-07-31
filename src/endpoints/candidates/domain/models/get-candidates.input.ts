import { IO, UnknownObject } from '@alien-worlds/aw-core';
/**
 * Represents input data to get candidates for a specific DAC.
 * @class
 * @implements {IO}
 */
export class GetCandidatesInput implements IO {
  /**
   * Creates a new instance of GetCandidatesInput with the provided DAC ID.
   *
   * @static
   * @public
   * @param {string} dacId - The ID of the DAC.
   * @returns {GetCandidatesInput} - The created GetCandidatesInput instance.
   */
  public static create(dacId: string) {
    return new GetCandidatesInput(dacId);
  }
  /**
   * @constructor
   * @public
   * @param {string} dacId - The ID of the DAC.
   */
  constructor(public readonly dacId: string) {}

  /**
   * Converts the GetCandidatesInput object to a plain object.
   *
   * @public
   * @returns {UnknownObject} - The plain object representing the GetCandidatesInput.
   */
  public toJSON(): UnknownObject {
    const { dacId } = this;
    return {
      dacId,
    };
  }
}
