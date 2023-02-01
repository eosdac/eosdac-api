import { Custodian, MemberTerms } from '@alien-worlds/eosdac-api-common';
import { Profile } from '../../../profile/domain/entities/profile';

/*imports*/
/**
 * Represents Custodian Profile data entity.
 * @class
 */
export class CustodianProfile {
	/**
	 * Creates instances of Custodian based on a given DTO.
	 *
	 * @static
	 * @public
	 * @returns {CustodianProfile}
	 */
	public static create(
		dacId: string,
		custodian: Custodian,
		profile: Profile,
		memberTerms: MemberTerms,
		agreedTermsVersion: number
	): CustodianProfile {
		const { name, requestedPay, totalVotePower } = custodian;

		const { version } = memberTerms.rest as { version: number };
		const votePower = totalVotePower / 10000n;

		return new CustodianProfile(
			name,
			requestedPay,
			Number(votePower),
			profile.profile,
			agreedTermsVersion,
			version === agreedTermsVersion,
			!!profile.error,
			false,
			dacId
		);
	}

	/**
	 * @private
	 * @constructor
	 */
	private constructor(
		public readonly walletId: string,
		public readonly requestedPay: string,
		public readonly votePower: number,
		public readonly profile: unknown,
		public readonly agreedTermVersion: number,
		public readonly currentPlanetMemberTermsSignedValid: boolean,
		public readonly isFlagged: boolean,
		public readonly isSelected: boolean,
		public readonly planetName: string
	) {}

	public toJson() {
		const {
			walletId,
			requestedPay,
			votePower,
			profile,
			agreedTermVersion,
			currentPlanetMemberTermsSignedValid,
			isFlagged,
			isSelected,
			planetName,
		} = this;

		return {
			walletId,
			requestedpay: requestedPay,
			votePower,
			profile,
			agreedTermVersion,
			currentPlanetMemberTermsSignedValid,
			isFlagged,
			isSelected,
			planetName,
		};
	}
}
