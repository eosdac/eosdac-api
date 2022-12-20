import { injectable, Result, UseCase } from '@alien-worlds/api-core';
import {
	WorkerProposal,
	WorkerProposalRepository,
} from '@alien-worlds/eosdac-api-common';
import { inject } from 'inversify';

import { ProposalsCountsInput } from '../models/proposals-counts.input';
import { ProposalsCountsQueryModel } from '../models/proposals-counts.query-model';

/*imports*/
/**
 * @class
 */
@injectable()
export class GetProposalsUseCase implements UseCase<WorkerProposal[]> {
	public static Token = 'GET_PROPOSALS_USE_CASE';

	constructor(
		/*injections*/
		@inject(WorkerProposalRepository.Token)
		private workerProposalRepository: WorkerProposalRepository
	) { }

	/**
	 * @async
	 * @returns {Promise<Result<WorkerProposal[]>>}
	 */
	public async execute(
		input: ProposalsCountsInput
	): Promise<Result<WorkerProposal[]>> {
		const model = ProposalsCountsQueryModel.create(input);

		return await this.workerProposalRepository.find(model);
	}

	/*methods*/
}
