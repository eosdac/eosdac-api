import { IO, Request, Response, RouteIO } from '@alien-worlds/aw-core';
import { GetProfileInput } from '../domain/models/get-profile.input';
import {
  ProfileRequestPathVariables,
  ProfileRequestQueryParams,
} from '../data/dtos/profile.dto';
import { GetProfileOutput } from '../domain/models/get-profile.output';

export class GetProfileRouteIO implements RouteIO {
  toResponse(output: GetProfileOutput): Response {
    const { profiles, failure } = output;
    if (failure) {
      return {
        status: 500,
        body: GetProfileOutput.create().toJSON(),
      };
    }
    if (profiles.length === 0) {
      return {
        status: 404,
        body: {
          error: 'profile not found',
        },
      };
    }

    return {
      status: 200,
      body: output.toJSON(),
    };
  }

  public fromRequest(
    request: Request<
      unknown,
      ProfileRequestPathVariables,
      ProfileRequestQueryParams
    >
  ): IO<unknown> {
    return GetProfileInput.create(request.params.dacId, request.query.account);
  }
}
