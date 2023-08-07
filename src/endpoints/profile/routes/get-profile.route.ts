import {
  GetRoute,
  Request,
  RouteHandler,
  ValidationResult,
} from '@alien-worlds/aw-core';
import {
  ProfileRequestPathVariables,
  ProfileRequestQueryParams,
} from '../data/dtos/profile.dto';

import { AjvValidator } from '@src/validator/ajv-validator';
import { GetProfileRequestSchema } from '../schemas';
import { GetProfileRouteIO } from './get-profile.route-io';
import ApiConfig from '@src/config/api-config';

/**
 * @class
 *
 *
 */
export class GetProfileRoute extends GetRoute {
  public static create(handler: RouteHandler, config: ApiConfig) {
    return new GetProfileRoute(handler, config);
  }

  private constructor(handler: RouteHandler, config: ApiConfig) {
    super(`/${config.urlVersion}/dao/:dacId/profile`, handler, {
      io: new GetProfileRouteIO(),
      validators: {
        request: validateRequest,
      },
    });
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
    GetProfileRequestSchema,
    request
  );
};
