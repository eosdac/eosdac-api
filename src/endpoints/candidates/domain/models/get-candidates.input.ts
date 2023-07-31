import { IO, UnknownObject } from '@alien-worlds/aw-core';
/**
 * @class
 */
export class GetCandidatesInput implements IO {
  public static create(dacId: string) {
    return new GetCandidatesInput(dacId);
  }
  /**
   *
   * @constructor
   * @param {string} dacId
   */
  constructor(public readonly dacId: string) {}

  public toJSON(): UnknownObject {
    const { dacId } = this;
    return {
      dacId,
    };
  }
}
