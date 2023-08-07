import { CustodianProfile } from '../entities/custodian-profile';
import { Failure, UnknownObject } from '@alien-worlds/aw-core';

/**
 * Represents the output data for getting custodians.
 * @class
 */
export class GetCustodiansOutput {
  /**
   * Creates an instance of GetCustodiansOutput based on a given array of custodian profiles and an optional failure.
   *
   * @static
   * @public
   * @param {CustodianProfile[]} profiles - An array of custodian profiles.
   * @param {Failure} [failure] - An optional failure object representing an error.
   * @returns {GetCustodiansOutput} - The created GetCustodiansOutput instance.
   */
  public static create(
    profiles: CustodianProfile[],
    failure?: Failure
  ): GetCustodiansOutput {
    return new GetCustodiansOutput(profiles, failure);
  }

  /**
   * @private
   * @constructor
   * @param {CustodianProfile[]} results - An array of custodian profiles.
   * @param {Failure} [failure] - An optional failure object representing an error.
   */
  private constructor(
    public readonly results: CustodianProfile[],
    public readonly failure?: Failure
  ) {}

  /**
   * Converts the GetCustodiansOutput instance to a JSON representation.
   *
   * @public
   * @returns {UnknownObject[]} - The JSON representation of the GetCustodiansOutput.
   */
  public toJSON(): UnknownObject[] {
    const { results, failure } = this;

    if (failure) {
      return [];
    }

    return results.map(profile => profile.toJSON());
  }
}
