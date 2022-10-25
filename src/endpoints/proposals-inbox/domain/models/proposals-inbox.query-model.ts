import {
	Filter,
	FindOptions,
	MongoFindQueryParams,
	QueryModel,
} from '@alien-worlds/api-core';

import { ProposalsInboxRequestDto } from '../../data/dtos/proposals-inbox.dto';
import { WorkerProposalDocument } from '@alien-worlds/eosdac-api-common';

/*imports*/

/**
 * @class
 */
export class ProposalsInboxQueryModel extends QueryModel {
	/**
	 * @returns {ProposalsInboxQueryModel}
	 */
	public static create(
		model: ProposalsInboxRequestDto
	): ProposalsInboxQueryModel {
		const { account, dacId: dac_id, skip, limit } = model;
		return new ProposalsInboxQueryModel(account, dac_id, skip, limit);
	}

	/**
	 * @constructor
	 * @private
	 */
	private constructor(
		public readonly account: string,
		public readonly dac_id: string,
		public readonly skip: number,
		public readonly limit: number
	) {
		super();
	}

	public toQueryParams(): MongoFindQueryParams<WorkerProposalDocument> {
		const { account, dac_id, skip, limit } = this;

		const filter: Filter<WorkerProposalDocument> = {
			$or: [
				{ status: 0, approve_voted: { $ne: account } },
				{ status: 2, finalize_voted: { $ne: account } },
			],
			dac_id,
		};

		const options: FindOptions = {
			sort: { block_num: -1 },
			skip: skip ? skip : 0,
			limit: limit ? limit : 30,
		};

		return { filter, options };
	}
}
