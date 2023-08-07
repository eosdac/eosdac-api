import { IO, UnknownObject } from '@alien-worlds/aw-core';

/**
 * Represents input data for retrieving voting history.
 *
 * @class
 * @implements {IO}
 */
export class VotingHistoryInput implements IO {
  /**
   * Creates a new instance of VotingHistoryInput.
   *
   * @method
   * @static
   * @param {string} dacId - The ID of the DAC.
   * @param {string} voter - The ID of the voter.
   * @param {number} skip - The number of records to skip.
   * @param {number} limit - The maximum number of records to retrieve.
   * @returns {VotingHistoryInput} The newly created VotingHistoryInput instance.
   */
  public static create(
    dacId: string,
    voter: string,
    skip: number,
    limit: number
  ): VotingHistoryInput {
    return new VotingHistoryInput(
      dacId.toLowerCase(),
      voter.toLowerCase(),
      Number(skip),
      Number(limit)
    );
  }

  /**
   * Creates a new instance of VotingHistoryInput.
   *
   * @method
   * @private
   * @constructor
   * @param {string} dacId - The ID of the DAC (Decentralized Autonomous Community).
   * @param {string} voter - The ID of the voter.
   * @param {number} skip - The number of records to skip.
   * @param {number} limit - The maximum number of records to retrieve.
   */
  private constructor(
    public readonly dacId: string,
    public readonly voter: string,
    public readonly skip: number,
    public readonly limit: number
  ) {}

  /**
   * Converts the VotingHistoryInput instance to a JSON representation.
   *
   * @method
   * @returns {UnknownObject} The JSON representation of the VotingHistoryInput instance.
   */
  public toJSON(): UnknownObject {
    const { dacId, voter, skip, limit } = this;
    return { dacId, voter, skip, limit };
  }
}
