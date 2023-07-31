import { IO, UnknownObject } from '@alien-worlds/aw-core';
/**
 * Represents input data for getting custodians.
 * @class
 */
export class GetCustodiansInput implements IO {
  /**
   * Creates an instance of GetCustodiansInput based on a given DAC ID.
   *
   * @static
   * @public
   * @param {string} dacId - The ID of the DAC.
   * @returns {GetCustodiansInput} - The created GetCustodiansInput instance.
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

  /**
   * Converts the GetCustodiansInput instance to a JSON representation.
   *
   * @public
   * @returns {UnknownObject} - The JSON representation of the GetCustodiansInput.
   */
  public toJSON(): UnknownObject {
    const { dacId } = this;

    return {
      dacId,
    };
  }
}
