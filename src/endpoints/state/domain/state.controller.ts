import { inject, injectable } from 'inversify';
import { GetCurrentBlockUseCase } from './use-cases/get-current-block.use-case';
import { GetStateOutput } from './models/get-state-output';
import { Result } from '@alien-worlds/api-core';

/*imports*/

/**
 * @class
 *
 *
 */
@injectable()
export class StateController {
	public static Token = 'STATE_CONTROLLER';

	constructor(
		@inject(GetCurrentBlockUseCase.Token)
		private getCurrentBlockUseCase: GetCurrentBlockUseCase
	) /*injections*/ {}

	/*methods*/

	/**
	 * @async
	 * @returns {Promise<Result<GetStateOutput>>}
	 */
	public async getState(): Promise<Result<GetStateOutput>> {
		const { content: state, failure: getCurrentBlockFailure } =
			await this.getCurrentBlockUseCase.execute();

		if (getCurrentBlockFailure) {
			return Result.withFailure(getCurrentBlockFailure);
		}

		return Result.withContent(GetStateOutput.create(state));
	}
}
