import { injectable, Result } from '@alien-worlds/api-core';
import { inject } from 'inversify';

import { ProposalsInboxOutput } from '../data/dtos/proposals-inbox.dto';
import { ProposalsInboxInput } from './models/proposals-inbox.input';
import { ListProposalsUseCase } from './use-cases/list-proposals.use-case';

/*imports*/

/**
 * @class
 *
 *
 */
@injectable()
export class ProposalsInboxController {
	public static Token = 'PROPOSALS_INBOX_CONTROLLER';

	constructor(
		@inject(ListProposalsUseCase.Token)
		private listProposalsUseCase: ListProposalsUseCase /*injections*/
	) { }

	/*methods*/

	/**
	 *
	 * @returns {Promise<Result<any>>}
	 */
	public async proposalsInbox(
		input: ProposalsInboxInput
	): Promise<Result<ProposalsInboxOutput, Error>> {
		const { content: proposals, failure: getProposalFailure } =
			await this.listProposalsUseCase.execute(input);

		if (getProposalFailure) {
			return Result.withFailure(getProposalFailure);
		}

		return Result.withContent({
			count: proposals.length || 0,
			results: proposals,
		});
	}
}
