import {
  Failure,
  IO,
  removeUndefinedProperties,
  UnknownObject,
} from '@alien-worlds/aw-core';

import { Profile } from '../entities/profile';

export class GetProfileOutput implements IO {
  public static create(
    results?: Profile[],
    count?: number,
    failure?: Failure
  ): GetProfileOutput {
    return new GetProfileOutput(results || [], count || 0, failure);
  }

  private constructor(
    public readonly profiles: Profile[],
    public readonly count: number,
    public readonly failure: Failure
  ) {}

  public toJSON(): UnknownObject {
    const { profiles, count, failure } = this;

    if (failure) {
      return {
        results: [],
        count: 0,
      };
    }

    const result = {
      results: profiles.map(profile => {
        const { blockNum, account, error } = profile;
        let output = {};

        if (error) {
          output = {
            account,
            error,
          };
        } else {
          output = {
            block_num: blockNum.toString(),
            account,
            profile: profile.profile.toJSON(),
          };
        }

        return removeUndefinedProperties(output);
      }),
      count,
    };

    return removeUndefinedProperties(result);
  }
}
