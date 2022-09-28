import { removeUndefinedProperties } from '../../../../common/utils/dto.utils';
import { State } from '@alien-worlds/eosdac-api-common';

export class GetStateOutput {
	public static create(state?: State): GetStateOutput {
		return new GetStateOutput(state);
	}

	private constructor(public readonly state: State) {}

	public toJson() {
		const { state } = this;
		return this.parseStateToResult(state);
	}

	/**
	 * Get Json object from the entity
	 *
	 * @returns {object}
	 */
	private parseStateToResult(state: State) {
		const { currentBlock } = state;
		const result = {
			currentBlock: Number(currentBlock),
		};

		return removeUndefinedProperties<object>(result);
	}
}
