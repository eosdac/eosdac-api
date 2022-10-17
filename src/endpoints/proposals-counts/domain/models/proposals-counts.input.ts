import { ProposalsCountsRequestDto } from '../../data/dtos/proposals-counts.dto';

/**
 * @class
 */
export class ProposalsCountsInput {
	/**
	 *
	 * @param {ProposalsCountsRequestDto} dto
	 * @returns {ProposalsCountsInput}
	 */
	public static fromRequest(
		dto: ProposalsCountsRequestDto
	): ProposalsCountsInput {
		const { account } = dto;

		return new ProposalsCountsInput(account);
	}
	/**
	 *
	 * @constructor
	 * @private
	 * @param {string} account
	 */
	private constructor(public readonly account: string) {}
}
