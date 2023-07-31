import { Request, Response, RouteIO } from '@alien-worlds/aw-core';
import { GetCustodiansInput } from '../domain/models/get-custodians.input';
import { GetCustodiansRequestPathVariables } from '../data/dtos/custodian.dto';
import { GetCustodiansOutput } from '../domain/models/get-custodians.output';

export class GetCustodiansRouteIO implements RouteIO {
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

  public fromRequest(
    request: Request<unknown, GetCustodiansRequestPathVariables>
  ): GetCustodiansInput {
    return GetCustodiansInput.create(request.params.dacId);
  }
}
