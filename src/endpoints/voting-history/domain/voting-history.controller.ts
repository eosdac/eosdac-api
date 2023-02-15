import { inject, injectable, Result } from '@alien-worlds/api-core';
import { GetUserVotingHistoryUseCase } from './use-cases/get-user-voting-history.use-case';
import { UserVote } from '@alien-worlds/eosdac-api-common';
import { VotingHistoryInput } from './models/voting-history.input';

/*imports*/

/**
 * @class
 *
 *
 */
@injectable()
export class VotingHistoryController {
	public static Token = 'VOTING_HISTORY_CONTROLLER';

	constructor(
		@inject(GetUserVotingHistoryUseCase.Token)
		private getUserVotingHistoryUseCase: GetUserVotingHistoryUseCase
	) /*injections*/ { }

	/*methods*/

	/**
	 *
	 * @returns {Promise<Result<UserVote[], Error>>}
	 */
	public async votingHistory(
		input: VotingHistoryInput
	): Promise<Result<UserVote[], Error>> {
		return await this.getUserVotingHistoryUseCase.execute(input);
	}
}
