import { Request, Response, RouteIO } from '@alien-worlds/aw-core';
import { VotingHistoryRequestQueryParams } from '../data/dtos/user-voting-history.dto';
import { VotingHistoryInput } from '../domain/models/voting-history.input';
import { VotingHistoryOutput } from '../domain/models/voting-history.output';

/**
 * Represents the RouteIO for the GetVotingHistory route.
 *
 * @class
 * @implements {RouteIO}
 */
export class GetVotingHistoryRouteIO implements RouteIO {
  /**
   * Converts the VotingHistoryOutput to a Response object for the route.
   *
   * @method
   * @param {VotingHistoryOutput} output - The VotingHistoryOutput to convert.
   * @returns {Response} The Response object for the route.
   */
  public toResponse(output: VotingHistoryOutput): Response {
    const { failure } = output;
    if (failure) {
      return {
        status: 500,
        body: {
          error: failure.error.message,
        },
      };
    }

    return {
      status: 200,
      body: output.toJSON(),
    };
  }
  /**
   * Converts the Request object to VotingHistoryInput for the route.
   *
   * @method
   * @param {Request<unknown, object, VotingHistoryRequestQueryParams>} request - The Request object for the route.
   * @returns {VotingHistoryInput} The VotingHistoryInput for the route.
   */
  public fromRequest(
    request: Request<unknown, object, VotingHistoryRequestQueryParams>
  ): VotingHistoryInput {
    const {
      query: { dacId = '', voter = '', skip = 0, limit = 20 },
    } = request;

    return VotingHistoryInput.create(dacId, voter, skip, limit);
  }
}
