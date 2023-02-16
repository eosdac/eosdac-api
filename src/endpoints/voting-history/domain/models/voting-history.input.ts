import { VotingHistoryRequestDto } from '../../data/dtos/user-voting-history.dto';

/**
 * @class
 */
export class VotingHistoryInput {
	/**
	 *
	 * @param {VotingHistoryRequestDto} dto
	 * @returns {VotingHistoryInput}
	 */
	public static fromRequest(
		dto: VotingHistoryRequestDto
	): VotingHistoryInput {
		const {
			dacId = '',
			voter = '',
			skip = 0,
			limit = 20,
		} = dto;

		return new VotingHistoryInput(
			dacId.toLowerCase(),
			voter.toLowerCase(),
			Number(skip),
			Number(limit)
		);
	}
	/**
	 *
	 * @constructor
	 * @private
	 * @param {string} dacId
	 * @param {string} voter 
	 * @param {number} skip
	 * @param {number} limit
	 */
	private constructor(
		public readonly dacId: string,
		public readonly voter: string,
		public readonly skip: number,
		public readonly limit: number
	) { }
}
