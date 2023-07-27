import { CustodianProfile } from '../entities/custodian-profile';
import { UnknownObject } from '@alien-worlds/aw-core';

export class GetCustodiansOutput {
  public static create(profiles: CustodianProfile[]): GetCustodiansOutput {
    return new GetCustodiansOutput(profiles);
  }

  private constructor(public readonly results: CustodianProfile[]) {}

  public toJSON(): UnknownObject[] {
    const { results } = this;

    return results.map(profile => profile.toJSON());
  }
}
