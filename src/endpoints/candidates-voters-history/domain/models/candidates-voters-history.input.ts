import { CandidatesVotersHistoryRequestDto } from '../../data/dtos/candidates-voters-history.dto';

/**
 * @class
 */
export class CandidatesVotersHistoryInput {
	/**
	 *
	 * @param {CandidatesVotersHistoryRequestDto} dto
	 * @returns {CandidatesVotersHistoryInput}
	 */
	public static fromRequest(
		dto: CandidatesVotersHistoryRequestDto
	): CandidatesVotersHistoryInput {
		const {
			dacId = '',
			candidateId = '',
			skip = 0,
			limit = 20,
		} = dto;

		return new CandidatesVotersHistoryInput(
			dacId.toLowerCase(),
			candidateId.toLowerCase(),
			Number(skip),
			Number(limit)
		);
	}
	/**
	 *
	 * @constructor
	 * @private
	 * @param {string} dacId
	 * @param {string} candidateId 
	 * @param {number} skip
	 * @param {number} limit
	 */
	private constructor(
		public readonly dacId: string,
		public readonly candidateId: string,
		public readonly skip: number,
		public readonly limit: number
	) { }
}
