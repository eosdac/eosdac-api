import { removeUndefinedProperties } from '@alien-worlds/api-core';
import { UserVote } from '../entities/user-vote';
import { VotingHistoryOutputItem } from '../../data/dtos/user-voting-history.dto';

export class VotingHistoryOutput {
	public static create(
		results: UserVote[]
	): VotingHistoryOutput {
		return new VotingHistoryOutput(results || [], results.length || 0);
	}

	private constructor(
		public readonly results: UserVote[],
		public readonly count: number
	) { }

	public toJson(): VotingHistoryOutput {
		const { results, count } = this;

		const result = {
			results: results.map(e => this.parseUserVoteToResult(e)),
			count,
		};

		return removeUndefinedProperties<VotingHistoryOutput>(result);
	}

	/**
	 * Get Json object from the entity
	 *
	 * @returns {VotingHistoryOutputItem}
	 */
	private parseUserVoteToResult(userVote: UserVote): VotingHistoryOutputItem {
		const { dacId, voter, voteTimestamp, candidate, candidateVotePower, action } = userVote;

		const dto = {
			dacId,
			voter,
			voteTimestamp,
			candidate,
			candidateVotePower,
			action,
		};

		return removeUndefinedProperties<VotingHistoryOutputItem>(dto);
	}
}
