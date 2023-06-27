import {
  EntityNotFoundError,
  GetRoute,
  Request,
  Result,
  RouteHandler,
  ValidationResult,
} from '@alien-worlds/api-core';
import {
  ProfileRequestPathVariables,
  ProfileRequestQueryParams,
} from '../data/dtos/profile.dto';

import { AjvValidator } from '@src/validator/ajv-validator';
import { config } from '@config';
import { ProfileInput } from '../domain/models/profile.input';
import { ProfileOutput } from '../domain/models/profile.output';
import { ProfileRequestSchema } from '../schemas';

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
    super(
      [
        `/${config.version}/dao/:dacId/profile`,
        `/${config.version}/eosdac/:dacId/profile`,
      ],
      handler,
      {
        validators: {
          request: validateRequest,
        },
        hooks: {
          pre: parseRequestToControllerInput,
          post: parseResultToControllerOutput,
        },
      }
    );
  }
}

/**
 *
 * @param {Request} request
 * @returns {ValidationResult}
 */
export const validateRequest = (
  request: Request<
    unknown,
    ProfileRequestPathVariables,
    ProfileRequestQueryParams
  >
): ValidationResult => {
  return AjvValidator.initialize().validateHttpRequest(
    ProfileRequestSchema,
    request
  );
};

/**
 *
 * @param {Request} request
 * @returns
 */
export const parseRequestToControllerInput = (
  request: Request<
    unknown,
    ProfileRequestPathVariables,
    ProfileRequestQueryParams
  >
) => {
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
    const {
      failure: { error },
    } = result;
    if (error) {
      if (error instanceof EntityNotFoundError) {
        return {
          status: 404,
          body: {
            error: 'profile not found',
          },
        };
      }

      return {
        status: 500,
        body: ProfileOutput.create().toJSON(),
      };
    }
  }

  const { content } = result;

  return {
    status: 200,
    body: ProfileOutput.create(content.results, content.count).toJSON(),
  };
};
