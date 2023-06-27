import { CandidateProfile } from './../entities/candidate-profile';

export class GetCandidatesOutput {
  public static create(profiles: CandidateProfile[]): GetCandidatesOutput {
    return new GetCandidatesOutput(profiles);
  }

  private constructor(public readonly results: CandidateProfile[]) {}

  public toJSON() {
    const { results } = this;

    return results.map(profile => profile.toJSON());
  }
}
