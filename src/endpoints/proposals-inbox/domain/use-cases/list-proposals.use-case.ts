import { injectable, Result, UseCase } from '@alien-worlds/api-core';
import { WorkerProposal, WorkerProposalRepository } from '@alien-worlds/eosdac-api-common';
import { inject } from 'inversify';

import { ProposalsInboxInput } from '../models/proposals-inbox.input';
import { ProposalsInboxQueryModel } from '../models/proposals-inbox.query-model';

/*imports*/
/**
 * @class
 */
@injectable()
export class ListProposalsUseCase implements UseCase<WorkerProposal[]> {
	public static Token = 'LIST_PROPOSALS_USE_CASE';

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
		input: ProposalsInboxInput
	): Promise<Result<WorkerProposal[]>> {
		const model = ProposalsInboxQueryModel.create({
			account: input.account,
			dacId: input.dacId,
			skip: input.skip,
			limit: input.limit,
		});

		return await this.workerProposalRepository.find(model);
	}

	/*methods*/
}
