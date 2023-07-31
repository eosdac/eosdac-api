import { CustodianProfile } from '../entities/custodian-profile';
import { Failure, UnknownObject } from '@alien-worlds/aw-core';

export class GetCustodiansOutput {
  //
  public static create(
    profiles: CustodianProfile[],
    failure?: Failure
  ): GetCustodiansOutput {
    return new GetCustodiansOutput(profiles, failure);
  }

  private constructor(
    public readonly results: CustodianProfile[],
    public readonly failure?: Failure
  ) {}

  public toJSON(): UnknownObject[] {
    const { results, failure } = this;

    if (failure) {
      return [];
    }

    return results.map(profile => profile.toJSON());
  }
}
