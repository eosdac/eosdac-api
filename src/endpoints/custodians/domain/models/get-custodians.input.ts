import { IO, UnknownObject } from '@alien-worlds/aw-core';
/**
 * @class
 */
export class GetCustodiansInput implements IO {
  /**
   *
   * @param {GetCustodiansRequestDto} dto
   * @returns {GetCustodiansInput}
   */
  public static create(dacId: string): GetCustodiansInput {
    return new GetCustodiansInput(dacId);
  }
  /**
   *
   * @constructor
   * @private
   * @param {string} dacId
   */
  private constructor(public readonly dacId: string) {}

  public toJSON(): UnknownObject {
    const { dacId } = this;

    return {
      dacId,
    };
  }
}
