/* eslint-disable sort-imports */
import { IO, Result, UnknownObject } from '@alien-worlds/aw-core';
import { CandidateProfile } from './../entities/candidate-profile';

export class GetCandidatesOutput implements IO<UnknownObject[]> {
  
  public static create(result: Result<CandidateProfile[]>) {
    return new GetCandidatesOutput(result);
  }

  constructor(public readonly result: Result<CandidateProfile[]>) {}

  public toJSON(): UnknownObject[] {
    const { result } = this;

    if (result.isFailure) {
      return [];
    }

    return result.content.map(profile => profile.toJSON());
  }
}
