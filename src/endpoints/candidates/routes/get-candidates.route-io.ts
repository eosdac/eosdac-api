/* eslint-disable sort-imports */
import { Request, Response, RouteIO } from '@alien-worlds/aw-core';
import { GetCandidatesInput } from '../domain/models/get-candidates.input';
import { GetCandidatesRequestPathVariables } from '../data/dtos/candidate.dto';
import { GetCandidatesOutput } from '../domain/models/get-candidates.output';

export class GetCandidatesRouteIO
  implements RouteIO<GetCandidatesInput, GetCandidatesOutput>
{
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

  public fromRequest(
    request: Request<unknown, GetCandidatesRequestPathVariables>
  ): GetCandidatesInput {
    return new GetCandidatesInput(request.params.dacId);
  }
}
