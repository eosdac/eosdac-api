/* eslint-disable sort-imports */
import { Request, Response, RouteIO } from '@alien-worlds/aw-core';
import { GetCandidatesInput } from '../domain/models/get-candidates.input';
import { GetCandidatesRequestPathVariables } from '../data/dtos/candidate.dto';
import { GetCandidatesOutput } from '../domain/models/get-candidates.output';

/**
 * Represents the RouteIO for handling input and output conversion of the GetCandidatesRoute.
 * @class
 * @implements {RouteIO<GetCandidatesInput, GetCandidatesOutput>}
 */
export class GetCandidatesRouteIO
  implements RouteIO<GetCandidatesInput, GetCandidatesOutput>
{
  /**
   * Converts the GetCandidatesOutput to a Response object.
   *
   * @public
   * @param {GetCandidatesOutput} output - The output containing the GetCandidates result.
   * @returns {Response} - The Response object.
   */
  public toResponse(output: GetCandidatesOutput): Response {
    const { result } = output;

    if (result.isFailure) {
      const {
        failure: { error },
      } = result;
      if (error) {
        return {
          status: 500,
          body: [],
        };
      }
    }

    return {
      status: 200,
      body: output.toJSON(),
    };
  }

  /**
   * Converts the Request object to a GetCandidatesInput object.
   *
   * @public
   * @param {Request<unknown, GetCandidatesRequestPathVariables>} request - The Request object containing the path variables.
   * @returns {GetCandidatesInput} - The GetCandidatesInput object.
   */
  public fromRequest(
    request: Request<unknown, GetCandidatesRequestPathVariables>
  ): GetCandidatesInput {
    return new GetCandidatesInput(request.params.dacId);
  }
}
