import { inject, injectable, Result, UseCase } from '@alien-worlds/aw-core';

import { CandidateProfile } from '../entities/candidate-profile';
import { Dac } from '@endpoints/dacs/domain/entities/dacs';
import { GetCandidatesUseCase } from './get-candidates.use-case';
import { GetMembersAgreedTermsUseCase } from './get-members-agreed-terms.use-case';
import { GetMemberTermsUseCase } from './get-member-terms.use-case';
import { GetProfilesUseCase } from '../../../profile/domain/use-cases/get-profiles.use-case';

/**
 * Represents a use case for listing candidate profiles for a specific DAC.
 * @class
 * @implements {UseCase<CandidateProfile[]>}
 */
@injectable()
export class ListCandidateProfilesUseCase
  implements UseCase<CandidateProfile[]>
{
  public static Token = 'LIST_CANDIDATE_PROFILES_USE_CASE';

  /**
   * @constructor
   * @param {GetCandidatesUseCase} getCandidatesUseCase - The use case to get candidates for a specific DAC.
   * @param {GetProfilesUseCase} getProfilesUseCase - The use case to get profiles for candidate accounts.
   * @param {GetMemberTermsUseCase} getMemberTermsUseCase - The use case to get member terms for a specific DAC.
   * @param {GetMembersAgreedTermsUseCase} getMembersAgreedTermsUseCase - The use case to get agreed terms for DAC members.
   */
  constructor(
    @inject(GetCandidatesUseCase.Token)
    private getCandidatesUseCase: GetCandidatesUseCase,
    @inject(GetProfilesUseCase.Token)
    private getProfilesUseCase: GetProfilesUseCase,
    @inject(GetMemberTermsUseCase.Token)
    private getMemberTermsUseCase: GetMemberTermsUseCase,
    @inject(GetMembersAgreedTermsUseCase.Token)
    private getMembersAgreedTermsUseCase: GetMembersAgreedTermsUseCase
  ) {}

  /**
   * Executes the ListCandidateProfilesUseCase to list candidate profiles for a specific DAC.
   *
   * @async
   * @public
   * @param {string} dacId - The ID of the DAC to list candidate profiles for.
   * @param {Dac} dacConfig - The configuration of the DAC.
   * @returns {Promise<Result<CandidateProfile[]>>} - The result containing the array of candidate profile objects.
   */
  public async execute(
    dacId: string,
    dacConfig: Dac
  ): Promise<Result<CandidateProfile[]>> {
    const { content: candidates, failure } =
      await this.getCandidatesUseCase.execute(dacId);

    if (failure) {
      return Result.withFailure(failure);
    }

    const accounts = candidates.map(candidate => candidate.candidateName);
    const { content: profiles, failure: getProfilesFailure } =
      await this.getProfilesUseCase.execute(
        dacConfig.accounts.custodian,
        dacId,
        accounts
      );

    if (getProfilesFailure) {
      return Result.withFailure(getProfilesFailure);
    }

    const { content: terms, failure: getMemberTermsFailure } =
      await this.getMemberTermsUseCase.execute(dacId);

    if (getMemberTermsFailure) {
      return Result.withFailure(getMemberTermsFailure);
    }

    const { content: agreedTerms, failure: getSignedMemberTermsFailure } =
      await this.getMembersAgreedTermsUseCase.execute(dacId, accounts);

    if (getSignedMemberTermsFailure) {
      return Result.withFailure(getSignedMemberTermsFailure);
    }

    const result: CandidateProfile[] = [];

    for (const candidate of candidates) {
      const profile = profiles.find(
        item => item.id === candidate.candidateName
      );
      const agreedTermsVersion = agreedTerms.get(candidate.candidateName);

      result.push(
        CandidateProfile.create(
          dacId,
          candidate,
          profile || null,
          terms,
          agreedTermsVersion
        )
      );
    }

    return Result.withContent(result);
  }
}
