import { IO, Request, UnknownObject } from '@alien-worlds/aw-core';
import { VotingHistoryRequestQueryParams } from '../../data/dtos/user-voting-history.dto';

/**
 * @class
 */
export class VotingHistoryInput implements IO {
  /**
   *
   * @param {VotingHistoryRequestQueryParams} request
   * @returns {VotingHistoryInput}
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
   *
   * @constructor
   * @private
   * @param {string} dacId
   * @param {string} voter
   * @param {number} skip
   * @param {number} limit
   */
  private constructor(
    public readonly dacId: string,
    public readonly voter: string,
    public readonly skip: number,
    public readonly limit: number
  ) {}

  public toJSON(): UnknownObject {
    const { dacId, voter, skip, limit } = this;
    return { dacId, voter, skip, limit };
  }
}
