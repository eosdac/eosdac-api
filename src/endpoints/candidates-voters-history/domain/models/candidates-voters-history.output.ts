import { CandidatesVotersHistoryControllerOutput, CandidatesVotersHistoryOutputItem } from '../../data/dtos/candidates-voters-history.dto';

import { removeUndefinedProperties } from '@alien-worlds/api-core';

export class CandidatesVotersHistoryOutput {
	public static create(
		data: CandidatesVotersHistoryControllerOutput
	): CandidatesVotersHistoryOutput {
		return new CandidatesVotersHistoryOutput(data.results || [], data.total || 0);
	}

	private constructor(
		public readonly results: CandidatesVotersHistoryOutputItem[],
		public readonly total: number
	) { }

	public toJson(): CandidatesVotersHistoryOutput {
		const { results, total } = this;

		const result = {
			results: results.map(this.parseCandidatesVotersHistoryItemToResult),
			total,
		};

		return removeUndefinedProperties<CandidatesVotersHistoryOutput>(result);
	}

	/**
	 * Get Json object from the entity
	 *
	 */
	private parseCandidatesVotersHistoryItemToResult(item: CandidatesVotersHistoryOutputItem) {
		const {
			voter,
			votingPower,
			action,
			candidate,
			voteTimestamp,
			transactionId
		} = item;

		const dto = {
			voter,
			votingPower: votingPower.toString(),
			action,
			candidate,
			voteTimestamp,
			transactionId
		};

		return removeUndefinedProperties<CandidatesVotersHistoryOutputItem>(dto);
	}
}
