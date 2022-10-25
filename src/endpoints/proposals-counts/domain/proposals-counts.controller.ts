import { Result } from '@alien-worlds/api-core';
import { inject, injectable } from 'inversify';

import { ProposalsCountOutput } from '../data/dtos/proposals-counts.dto';
import { ProposalsCountsInput } from './models/proposals-counts.input';
import { GetProposalsUseCase } from './use-cases/get-proposals.use-case';

/*imports*/

/**
 * @class
 *
 *
 */
@injectable()
export class ProposalsCountsController {
	public static Token = 'PROPOSALS_COUNTS_CONTROLLER';

	constructor(
		@inject(GetProposalsUseCase.Token)
		private getProposalsUseCase: GetProposalsUseCase /*injections*/
	) {}

	/*methods*/

	/**
	 *
	 * @returns {Promise<Result<any>>}
	 */
	public async proposalsCounts(
		input: ProposalsCountsInput
	): Promise<Result<ProposalsCountOutput, Error>> {
		const { content: proposals, failure: getProposalFailure } =
			await this.getProposalsUseCase.execute(input);

		if (getProposalFailure) {
			return Result.withFailure(getProposalFailure);
		}

		return Result.withContent({
			count: proposals ? proposals.length : 0,
		});
	}
}
