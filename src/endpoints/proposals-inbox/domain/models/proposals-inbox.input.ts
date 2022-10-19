import { ProposalsInboxRequestDto } from '../../data/dtos/proposals-inbox.dto';

/**
 * @class
 */
export class ProposalsInboxInput {
	/**
	 *
	 * @param {ProposalsInboxRequestDto} dto
	 * @returns {ProposalsInboxInput}
	 */
	public static fromRequest(
		dto: ProposalsInboxRequestDto
	): ProposalsInboxInput {
		const { account, dacId, skip, limit } = dto;

		return new ProposalsInboxInput(
			account,
			dacId,
			Number(skip),
			Number(limit)
		);
	}
	/**
	 *
	 * @constructor
	 * @private
	 * @param {string} account
	 */
	private constructor(
		public readonly account: string,
		public readonly dacId: string,
		public readonly skip: number,
		public readonly limit: number
	) { }
}
