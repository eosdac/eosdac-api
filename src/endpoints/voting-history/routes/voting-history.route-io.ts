import { Request, Response, RouteIO } from '@alien-worlds/aw-core';
import { VotingHistoryRequestQueryParams } from '../data/dtos/user-voting-history.dto';
import { VotingHistoryInput } from '../domain/models/voting-history.input';
import { VotingHistoryOutput } from '../domain/models/voting-history.output';

export class GetVotingHistoryRouteIO implements RouteIO {
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
  fromRequest(
    request: Request<unknown, object, VotingHistoryRequestQueryParams>
  ): VotingHistoryInput {
    const {
      query: { dacId = '', voter = '', skip = 0, limit = 20 },
    } = request;

    return VotingHistoryInput.create(dacId, voter, skip, limit);
  }
}
