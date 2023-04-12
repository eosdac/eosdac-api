import { CandidatesVotersHistoryRequestQueryParams } from '../../data/dtos/candidates-voters-history.dto';

/**
 * @class
 */
export class CandidatesVotersHistoryInput {
  /**
   *
   * @param {CandidatesVotersHistoryRequestQueryParams} queryParams
   * @returns {CandidatesVotersHistoryInput}
   */
  public static fromRequest(
    queryParams: CandidatesVotersHistoryRequestQueryParams
  ): CandidatesVotersHistoryInput {
    const { dacId = '', candidateId = '', skip = 0, limit = 20 } = queryParams;

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
  ) {}
}
