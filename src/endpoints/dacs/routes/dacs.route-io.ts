import {
  Request,
  Response,
  RouteIO,
  SmartContractDataNotFoundError,
} from '@alien-worlds/aw-core';
import { GetDacsRequestQueryParams } from '../data/dtos/dacs.dto';
import { GetDacsInput } from '../domain/models/dacs.input';
import { GetDacsOutput } from '../domain/models/get-dacs.output';

/**
 * Represents the RouteIO for handling custodians list route input/output.
 */
export class GetDacsRouteIO extends RouteIO {
  /**
   * Converts the output of the route to the server's response format.
   * @param {GetDacsOutput} output - The output of the route.
   * @returns {Response} - The server's response.
   */
  public toResponse(output: GetDacsOutput): Response {
    const { result } = output;
    if (result.isFailure) {
      const {
        failure: { error },
      } = result;
      return {
        status: error instanceof SmartContractDataNotFoundError ? 404 : 500,
        body: {
          error: error.message,
        },
      };
    }

    return {
      status: 200,
      body: output.toJSON(),
    };
  }

  /**
   * Converts the request data to the input format.
   * @param {Request} request - The server's request.
   * @returns {GetDacsInput} - The input data.
   */
  public fromRequest(
    request: Request<unknown, unknown, GetDacsRequestQueryParams>
  ): GetDacsInput {
    const {
      query: { dacId, limit },
    } = request;
    return GetDacsInput.create(dacId, limit);
  }
}
