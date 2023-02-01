/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	Candidate,
	MemberTerms,
	TokenWorldsMemberTermsTableRow,
} from '@alien-worlds/eosdac-api-common';
import { CandidateProfile } from '../../entities/candidate-profile';
import { GetCandidatesOutput } from '../get-candidates.output';
import { Profile } from '../../../../profile/domain/entities/profile';

describe('GetCandidatesOutput', () => {
	let dacId: string;
	let candidates: Candidate[];
	let profiles: Profile[];
	let terms: TokenWorldsMemberTermsTableRow;
	let agreedTerms: Map<string, number>;
	let votedCandidates: string[];
	let candidateProfiles: CandidateProfile[];

	beforeEach(() => {
		dacId = 'dacId';
		candidates = [
			Candidate.fromTableRow({
				is_active: 1,
				candidate_name: 'candidate1',
				requestedpay: 'test',
				total_votes: 1,
				avg_vote_time_stamp: new Date().toISOString(),
				rank: 1,
				gap_filler: 1,
				total_vote_power: 1,
			}),
			Candidate.fromTableRow({
				is_active: 1,
				candidate_name: 'candidate2',
				requestedpay: 'test',
				total_votes: 1,
				avg_vote_time_stamp: new Date().toISOString(),
				rank: 1,
				gap_filler: 1,
				total_vote_power: 1,
			}),
		] as any;
		profiles = [
			Profile.fromDto({
				block_num: 1,
				action: {
					account: 'candidate1',
					name: '',
					data: { cand: '', profile: '{}' },
				},
			} as any),
			Profile.fromDto({
				block_num: 1,
				action: {
					account: 'candidate2',
					name: '',
					data: { cand: '', profile: '{}' },
				},
			} as any),
		] as any;
		terms = { rest: { version: 1 } } as any;
		agreedTerms = new Map<string, number>();
		agreedTerms.set('candidate1', 1);
		votedCandidates = ['candidate1'];
		candidateProfiles = [
			CandidateProfile.create(
				dacId,
				candidates[0],
				profiles[0],
				MemberTerms.fromTableRow(terms),
				1,
				votedCandidates
			),
			CandidateProfile.create(
				dacId,
				candidates[1],
				profiles[1],
				MemberTerms.fromTableRow(terms),
				1,
				votedCandidates
			),
		];
	});

	it('should create a GetCandidatesOutput object with the correct properties', () => {
		const result = GetCandidatesOutput.create(candidateProfiles);

		expect(result).toBeInstanceOf(GetCandidatesOutput);
		expect(result.results).toBeDefined();
	});

	it('should create a CandidateProfile for each candidate in the input array', () => {
		const result = GetCandidatesOutput.create(candidateProfiles);

		expect(result.results).toHaveLength(2);

		expect(result.results[0]).toBeInstanceOf(CandidateProfile);
		expect(result.results[0].walletId).toBeDefined();
		expect(result.results[0].requestedPay).toBeDefined();
		expect(result.results[0].votePower).toBeDefined();
		expect(result.results[0].rank).toBeDefined();
		expect(result.results[0].gapFiller).toBeDefined();
		expect(result.results[0].isActive).toBeDefined();
		expect(result.results[0].totalVotes).toBeDefined();
		expect(result.results[0].voteDecay).toBeDefined();
		expect(result.results[0].profile).toBeDefined();
		expect(result.results[0].agreedTermVersion).toBeDefined();
		expect(result.results[0].currentPlanetMemberTermsSignedValid).toBeDefined();
		expect(result.results[0].isFlagged).toBeDefined();
		expect(result.results[0].isSelected).toBeDefined();
		expect(result.results[0].isVoted).toBeDefined();
		expect(result.results[0].isVoteAdded).toBeDefined();
		expect(result.results[0].planetName).toBeDefined();
	});
});
