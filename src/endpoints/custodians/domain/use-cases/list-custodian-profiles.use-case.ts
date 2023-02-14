import { inject, injectable, Result, UseCase } from '@alien-worlds/api-core';
import { DacDirectory } from '@alien-worlds/eosdac-api-common';
import { Profile } from '../../../profile/domain/entities/profile';

import { GetProfilesUseCase } from '../../../profile/domain/use-cases/get-profiles.use-case';
import { CustodianProfile } from '../entities/custodian-profile';
import { GetMemberTermsUseCase } from './../../../candidates/domain/use-cases/get-member-terms.use-case';
import { GetMembersAgreedTermsUseCase } from './../../../candidates/domain/use-cases/get-members-agreed-terms.use-case';
import { GetCustodiansUseCase } from './get-custodians.use-case';

/*imports*/
/**
 * @class
 */
@injectable()
export class ListCustodianProfilesUseCase
	implements UseCase<CustodianProfile[]>
{
	public static Token = 'LIST_CUSTODIAN_PROFILES_USE_CASE';

	constructor(
		/*injections*/
		@inject(GetCustodiansUseCase.Token)
		private getCustodiansUseCase: GetCustodiansUseCase,
		@inject(GetProfilesUseCase.Token)
		private getProfilesUseCase: GetProfilesUseCase,
		@inject(GetMemberTermsUseCase.Token)
		private getMemberTermsUseCase: GetMemberTermsUseCase,
		@inject(GetMembersAgreedTermsUseCase.Token)
		private getMembersAgreedTermsUseCase: GetMembersAgreedTermsUseCase
	) { }

	/**
	 * @async
	 * @returns {Promise<Result<CustodianProfile[]>>}
	 */
	public async execute(
		dacId: string,
		dacConfig: DacDirectory
	): Promise<Result<CustodianProfile[]>> {
		const { content: custodians, failure } =
			await this.getCustodiansUseCase.execute(dacId);

		if (failure) {
			return Result.withFailure(failure);
		}

		const accounts = custodians.map(candidate => candidate.name);

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

		const result: CustodianProfile[] = [];

		for (const custodian of custodians) {
			const profile = profiles.find(item => item.id === custodian.name);
			const agreedTermsVersion = agreedTerms.get(custodian.name);

			result.push(
				CustodianProfile.create(
					dacId,
					custodian,
					Profile.fromDto(profile.toDocument()),
					terms,
					agreedTermsVersion
				)
			);
		}

		return Result.withContent(result);
	}

	/*methods*/
}