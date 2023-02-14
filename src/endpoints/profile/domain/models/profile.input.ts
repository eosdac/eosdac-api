import { ProfileRequestDto } from '../../data/dtos/profile.dto';
import { Request } from '@alien-worlds/api-core';
/**
 * @class
 */
export class ProfileInput {
	/**
	 *
	 * @param {ProfileRequestDto} dto
	 * @returns {ProfileInput}
	 */
	public static fromRequest(
		request: Request<ProfileRequestDto>
	): ProfileInput {
		let accounts: string[]

		if (request.query.account) {
			accounts = request.query.account.split(',')
		}

		return new ProfileInput(
			accounts,
			request.params['dacId']
		)
	}
	/**
	 *
	 * @constructor
	 * @private
	 * @param {string[]} accounts
	 * @param {string} dacId
	 */
	private constructor(
		public readonly accounts: string[],
		public readonly dacId: string,
	) { }
}