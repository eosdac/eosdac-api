import {
	Filter,
	FindOptions,
	MongoFindQueryParams,
	QueryModel,
} from '@alien-worlds/api-core';

import { ProposalsCountsRequestDto } from '../../data/dtos/proposals-counts.dto';

/*imports*/

/**
 * @class
 */
export class ProposalsCountsQueryModel extends QueryModel {
	/**
	 * @returns {ProposalsCountsQueryModel}
	 */
	public static create(
		model: ProposalsCountsRequestDto
	): ProposalsCountsQueryModel {
		const { account } = model;
		return new ProposalsCountsQueryModel(account);
	}

	/**
	 * @constructor
	 * @private
	 */
	private constructor(public readonly account: string) {
		super();
	}

	public toQueryParams(): MongoFindQueryParams<unknown> {
		const { account } = this;

		const filter: Filter<unknown> = {
			$or: [
				{ status: 0, approve_voted: { $ne: account } },
				{ status: 2, finalize_voted: { $ne: account } },
			],
			dac_id: 'eos.dac',
		};

		const options: FindOptions = {
			sort: { block_num: -1 },
		};

		return { filter, options };
	}
}
