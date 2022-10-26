import { Profile } from '../entities/profile';
import { removeUndefinedProperties } from '@alien-worlds/api-core';

export class ProfileOutput {
	public static create(
		results?: Profile[],
		count?: number
	): ProfileOutput {
		return new ProfileOutput(results || [], count || 0);
	}

	private constructor(
		public readonly results: Profile[],
		public readonly count: number
	) { }

	public toJson() {
		const { results, count } = this;

		const result = {
			results: results.map(e => this.parseProfileToResult(e)),
			count,
		};

		return removeUndefinedProperties(result);
	}

	/**
	 * Get Json object from the entity
	 *
	 * @returns {object}
	 */
	private parseProfileToResult(p: Profile) {
		const {
			blockNum,
			account,
			profile,
			error,
		} = p;

		let dto = {}

		if (error) {
			dto = {
				account,
				error,
			};
		} else {
			dto = {
				block_num: blockNum.toString(),
				account,
				profile,
			};
		}

		return removeUndefinedProperties(dto);
	}
}
