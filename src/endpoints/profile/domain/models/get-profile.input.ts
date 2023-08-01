import { IO, UnknownObject } from '@alien-worlds/aw-core';

/**
 * @class
 */
export class GetProfileInput implements IO {
  /**
   *
   * @param {ProfileRequestDto} dto
   * @returns {GetProfileInput}
   */
  public static create(dacId: string, accounts: string): GetProfileInput {
    return new GetProfileInput(dacId, accounts?.split(',') || []);
  }
  /**
   *
   * @constructor
   * @private
   * @param {string} dacId
   * @param {string[]} accounts
   */
  private constructor(
    public readonly dacId: string,
    public readonly accounts: string[]
  ) {}

  public toJSON(): UnknownObject {
    const { dacId, accounts } = this;

    return { dacId, accounts };
  }
}
