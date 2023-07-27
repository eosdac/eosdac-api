import {
  GetCandidatesRequestPathVariables,
  GetCandidatesRequestQueryParams,
} from '../../data/dtos/candidate.dto';

import { Request } from '@alien-worlds/aw-core';
/**
 * @class
 */
export class GetCandidatesInput {
  /**
   *
   * @param {CandidateRequestDto} dto
   * @returns {GetCandidatesInput}
   */
  public static fromRequest(
    request: Request<
      unknown,
      GetCandidatesRequestPathVariables,
      GetCandidatesRequestQueryParams
    >
  ): GetCandidatesInput {
    return new GetCandidatesInput(request.query.walletId, request.params.dacId);
  }
  /**
   *
   * @constructor
   * @private
   * @param {string} walletId
   * @param {string} dacId
   */
  private constructor(
    public readonly walletId: string,
    public readonly dacId: string
  ) {}
}
