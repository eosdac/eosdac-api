import { GetCustodiansRequestPathVariables } from '../../data/dtos/custodian.dto';
import { Request } from '@alien-worlds/api-core';
/**
 * @class
 */
export class GetCustodiansInput {
  /**
   *
   * @param {GetCustodiansRequestDto} dto
   * @returns {GetCustodiansInput}
   */
  public static fromRequest(
    request: Request<unknown, GetCustodiansRequestPathVariables>
  ): GetCustodiansInput {
    return new GetCustodiansInput(request.params.dacId);
  }
  /**
   *
   * @constructor
   * @private
   * @param {string} dacId
   */
  private constructor(public readonly dacId: string) {}
}
