import {
	Filter,
	FindOptions,
	MongoFindQueryParams,
	QueryModel,
} from '@alien-worlds/api-core';

import { UserVotingHistoryDocument } from '../../data/dtos/user-voting-history.dto';
import { VotingHistoryInput } from './voting-history.input';

/*imports*/

/**
 * @class
 */
export class VotingHistoryQueryModel extends QueryModel {
	/**
	 * @returns {VotingHistoryQueryModel}
	 */
	public static create(
		input: VotingHistoryInput
	): VotingHistoryQueryModel {
		const { dacId, voter, skip, limit } = input;
		return new VotingHistoryQueryModel(dacId, voter, skip, limit);
	}

	/**
	 * @constructor
	 * @private
	 */
	private constructor(
		public readonly dacId: string,
		public readonly voter: string,
		public readonly skip: number,
		public readonly limit: number
	) {
		super();
	}

	public toQueryParams(): MongoFindQueryParams<UserVotingHistoryDocument> {
		const { dacId, voter, skip, limit } = this;

		const filter: Filter<UserVotingHistoryDocument> = {
			'action.account': 'dao.worlds',
			'action.name': 'votecust',
			'action.data.dac_id': dacId,
			'action.data.voter': voter
		};

		const options: FindOptions = {
			skip,
			limit,
			sort: { block_num: 1 },
		};

		return { filter, options };
	}
}
