import { inject } from 'inversify';
import { injectable, Result, UseCase } from '@alien-worlds/api-core';

import { State, StateRepository } from '@alien-worlds/eosdac-api-common';

/*imports*/
/**
 * @class
 */
@injectable()
export class GetCurrentBlockUseCase implements UseCase<State> {
	public static Token = 'GET_CURRENT_BLOCK_USE_CASE';

	constructor(
		/*injections*/
		@inject(StateRepository.Token)
		private stateRepository: StateRepository
	) { }

	/*methods*/

	/**
	 * @async
	 * @returns {Promise<Result<State>>}
	 */
	public async execute(): Promise<Result<State>> {
		return this.stateRepository.getCurrentBlock();
	}
}
