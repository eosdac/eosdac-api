import { EntityNotFoundError, GetRoute, Request, Result, RouteHandler } from '@alien-worlds/api-core';

import { ProfileInput } from '../domain/models/profile.input';
import { ProfileOutput } from '../domain/models/profile.output';
import { ProfileRequestDto } from '../data/dtos/profile.dto';

/*imports*/




/**
 * @class
 * 
 * 
 */
export class GetProfileRoute extends GetRoute {
  public static create(handler: RouteHandler) {
    return new GetProfileRoute(handler);
  }

  private constructor(handler: RouteHandler) {
    super('/v1/dao/:dacId/profile', handler, {
      hooks: {
        pre: parseRequestToControllerInput,
        post: parseResultToControllerOutput,
      },
    });
  }
}

/**
 *
 * @param {Request} request
 * @returns
 */
export const parseRequestToControllerInput = (request: Request<ProfileRequestDto>) => {
  // parse DTO (query) to the options required by the controller method
  return ProfileInput.fromRequest(request);
};

/**
 *
 * @param {Result<ProfileOutput>} result
 * @returns
 */
export const parseResultToControllerOutput = (
  result: Result<ProfileOutput>
) => {
  if (result.isFailure) {
    const { failure: { error } } = result;
    if (error) {
      if (error instanceof EntityNotFoundError) {
        return {
          status: 404,
          body: {
            error: "profile not found",
          },
        };
      }

      return {
        status: 500,
        body: ProfileOutput.create().toJson(),
      };
    }
  }

  const { content } = result;

  return {
    status: 200,
    body: ProfileOutput.create(content.results, content.count).toJson(),
  };
};

