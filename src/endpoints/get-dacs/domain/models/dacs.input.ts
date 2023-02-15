import { GetDacsRequestDto } from '../../data/dtos/dacs.dto';
import { Request } from '@alien-worlds/api-core';
/**
 * @class
 */
export class GetDacsInput {
	/**
	 *
	 * @param {GetDacsRequestDto} dto
	 * @returns {GetDacsInput}
	 */
	public static fromRequest(
		request: Request<GetDacsRequestDto>
	): GetDacsInput {
		return new GetDacsInput(
			request.query.dacId,
			request.query.limit,
		)
	}
	/**
	 *
	 * @constructor
	 * @private
	 * @param {string} dacId
	 * @param {number} limit
	 */
	private constructor(
		public readonly dacId: string,
		public readonly limit: number = 10,
	) { }
}
