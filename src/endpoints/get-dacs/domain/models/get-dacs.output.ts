import { GetDacOutput } from './get-dac.output';
import { removeUndefinedProperties } from '@alien-worlds/api-core';

export class GetDacsOutput {
	public static create(
		results?: GetDacOutput[],
	): GetDacsOutput {
		return new GetDacsOutput(results, results.length);
	}

	private constructor(
		public readonly results: GetDacOutput[],
		public readonly count: number
	) { }

	public toJson() {
		const { count, results } = this;

		const result = {
			results: results.map(this.parseDacToResult),
			count,
		};

		return removeUndefinedProperties(result);
	}

	/**
	 * Get Json object from the entity
	 *
	 * @returns {object}
	 */
	private parseDacToResult(dac: GetDacOutput) {
		return removeUndefinedProperties(dac.toJson());
	}
}
