import { inject, injectable, Result, UseCase } from '@alien-worlds/api-core';
import { CandidateProfile } from '../entities/candidate-profile';
import { DacDirectory } from '@alien-worlds/eosdac-api-common';
import { GetCandidatesUseCase } from './get-candidates.use-case';
import { GetMembersAgreedTermsUseCase } from './get-members-agreed-terms.use-case';
import { GetMemberTermsUseCase } from './get-member-terms.use-case';
import { GetProfilesUseCase } from '../../../profile/domain/use-cases/get-profiles.use-case';
import { GetVotedCandidateIdsUseCase } from './get-voted-candidate-ids.use-case';
import { Profile } from '../../../profile/domain/entities/profile';

/*imports*/
/**
 * @class
 */
@injectable()
export class ListCandidateProfilesUseCase
	implements UseCase<CandidateProfile[]>
{
	public static Token = 'LIST_CANDIDATE_PROFILES_USE_CASE';

	constructor(
		/*injections*/
		@inject(GetCandidatesUseCase.Token)
		private getCandidatesUseCase: GetCandidatesUseCase,
		@inject(GetProfilesUseCase.Token)
		private getProfilesUseCase: GetProfilesUseCase,
		@inject(GetMemberTermsUseCase.Token)
		private getMemberTermsUseCase: GetMemberTermsUseCase,
		@inject(GetMembersAgreedTermsUseCase.Token)
		private getMembersAgreedTermsUseCase: GetMembersAgreedTermsUseCase,
		@inject(GetVotedCandidateIdsUseCase.Token)
		private getVotedCandidateIdsUseCase: GetVotedCandidateIdsUseCase
	) { }

	/**
	 * @async
	 * @returns {Promise<Result<CandidateProfile[]>>}
	 */
	public async execute(
		dacId: string,
		walletId: string,
		dacConfig: DacDirectory
	): Promise<Result<CandidateProfile[]>> {
		const { content: candidates, failure } =
			await this.getCandidatesUseCase.execute(dacId);

		if (failure) {
			return Result.withFailure(failure);
		}

		const accounts = candidates.map(candidate => candidate.name);

		const { content: votedCandidates, failure: getVotedCandidateIdsFailure } =
			await this.getVotedCandidateIdsUseCase.execute(dacId, walletId);

		if (getVotedCandidateIdsFailure) {
			return Result.withFailure(getVotedCandidateIdsFailure);
		}

		const { content: profiles, failure: getProfilesFailure } =
			await this.getProfilesUseCase.execute({
				custContract: dacConfig.accounts.custodian,
				dacId,
				accounts,
			});

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
			const profile = profiles.find(item => item.id === candidate.name);
			const agreedTermsVersion = agreedTerms.get(candidate.name);

			result.push(
				CandidateProfile.create(
					dacId,
					candidate,
					profile ? Profile.fromDto(profile.toDocument()) : null,
					terms,
					agreedTermsVersion,
					votedCandidates
				)
			);
		}

		return Result.withContent(result);
	}

	/*methods*/
}
