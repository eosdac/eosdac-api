import {
	DaoWorldsContract,
	RequestedPayment,
	TokenWorldsContract,
} from '@alien-worlds/eosdac-api-common';

import { Profile } from './../../../profile/domain/entities/profile';

/*imports*/
/**
 * Represents Candidate Profile data entity.
 * @class
 */
export class CandidateProfile {
	/**
	 * Creates instances of Candidate based on a given DTO.
	 *
	 * @static
	 * @public
	 * @returns {CandidateProfile}
	 */
	public static create(
		dacId: string,
		candidate: DaoWorldsContract.Deltas.Entities.Candidate,
		profile: Profile,
		memberTerms: TokenWorldsContract.Deltas.Entities.MemberTerms,
		agreedTermsVersion: number,
		votedCandidates: string[]
	): CandidateProfile {
		const {
			name,
			requestedPayment,
			votersCount,
			isActive,
			avgVoteTimestamp,
			rank,
			totalVotePower,
			gapFiller,
		} = candidate;

		const { version } = memberTerms;

		const voteDecay =
			new Date(avgVoteTimestamp).getFullYear() > 1970
				? Math.ceil(
					(new Date().getTime() - new Date(avgVoteTimestamp).getTime()) /
					(3600 * 24 * 1000)
				)
				: null;
		const votePower = totalVotePower / 10000n;

		return new CandidateProfile(
			name,
			requestedPayment,
			votePower,
			rank,
			gapFiller,
			isActive,
			votersCount,
			voteDecay,
			profile?.profile,
			agreedTermsVersion,
			Number(version) === agreedTermsVersion,
			!!profile?.error,
			false,
			votedCandidates.includes(name),
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
		public readonly requestedPay: RequestedPayment,
		public readonly votePower: bigint,
		public readonly rank: bigint,
		public readonly gapFiller: bigint,
		public readonly isActive: boolean,
		public readonly totalVotes: number,
		public readonly voteDecay: number,
		public readonly profile: unknown,
		public readonly agreedTermVersion: number,
		public readonly currentPlanetMemberTermsSignedValid: boolean,
		public readonly isFlagged: boolean,
		public readonly isSelected: boolean,
		public readonly isVoted: boolean,
		public readonly isVoteAdded: boolean,
		public readonly planetName: string
	) { }

	public toJson() {
		const {
			walletId,
			requestedPay,
			votePower,
			rank,
			gapFiller,
			isActive,
			totalVotes,
			voteDecay,
			profile,
			agreedTermVersion,
			currentPlanetMemberTermsSignedValid,
			isFlagged,
			isSelected,
			isVoted,
			isVoteAdded,
			planetName,
		} = this;

		return {
			walletId,
			requestedpay: `${requestedPay.value} ${requestedPay.symbol}`,
			votePower: Number(votePower),
			rank: Number(rank),
			gapFiller: Number(gapFiller),
			isActive: Number(isActive),
			totalVotes,
			voteDecay,
			profile,
			agreedTermVersion,
			currentPlanetMemberTermsSignedValid,
			isFlagged,
			isSelected,
			isVoted,
			isVoteAdded,
			planetName,
		};
	}
}
