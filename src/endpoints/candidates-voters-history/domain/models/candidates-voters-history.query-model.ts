import { AggregateOptions, MongoAggregateParams, QueryModel } from '@alien-worlds/api-core';

import { CandidatesVotersHistoryInput } from './candidates-voters-history.input';

/*imports*/

/**
 * @class
 */
export class CandidatesVotersHistoryQueryModel extends QueryModel {

	/**
	 * @returns {CandidatesVotersHistoryQueryModel}
	 */
	public static create(
		input: CandidatesVotersHistoryInput
	): CandidatesVotersHistoryQueryModel {
		const { dacId, candidateId, skip, limit } = input;
		return new CandidatesVotersHistoryQueryModel(dacId, candidateId, skip, limit);
	}

	/**
	 * @constructor
	 * @private
	 */
	private constructor(
		public readonly dacId: string,
		public readonly candidateId: string,
		public readonly skip: number,
		public readonly limit: number
	) {
		super();
	}

	public toQueryParams(): MongoAggregateParams {
		const { candidateId, dacId } = this;

		const pipeline: object[] = [
			{
				'$match': {
					'action.account': 'dao.worlds',
					'action.name': 'votecust',
					'action.data.dac_id': dacId,
					'action.data.newvotes': candidateId
				}
			}, {
				'$sort': {
					'block_num': 1
				}
			},
		];

		const options: AggregateOptions = {};

		return { pipeline, options };
	}
}
