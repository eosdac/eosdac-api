import { Request, Response, RouteIO } from '@alien-worlds/aw-core';
import { GetCustodiansInput } from '../domain/models/get-custodians.input';
import { GetCustodiansRequestPathVariables } from '../data/dtos/custodian.dto';
import { GetCustodiansOutput } from '../domain/models/get-custodians.output';

/**
 * Represents the RouteIO for handling custodians list route input/output.
 * @class
 */
export class GetCustodiansRouteIO implements RouteIO {
  /**
   * Converts the output of the GetCustodiansUseCase to a response format.
   *
   * @public
   * @param {GetCustodiansOutput} output - The output data from the GetCustodiansUseCase.
   * @returns {Response} - The Response object with status code and body.
   */
  public toResponse(output: GetCustodiansOutput): Response {
    const { failure } = output;
    if (failure) {
      return {
        status: 500,
        body: [],
      };
    }

    return {
      status: 200,
      body: output.toJSON(),
    };
  }

  /**
   * Converts the request object to the input format for the GetCustodiansUseCase.
   *
   * @public
   * @param {Request<unknown, GetCustodiansRequestPathVariables>} request - The request object containing the path variables.
   * @returns {GetCustodiansInput} - The GetCustodiansInput object containing the DAC ID.
   */
  public fromRequest(
    request: Request<unknown, GetCustodiansRequestPathVariables>
  ): GetCustodiansInput {
    return GetCustodiansInput.create(request.params.dacId);
  }
}
