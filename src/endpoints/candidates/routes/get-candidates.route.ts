/* eslint-disable sort-imports */
import { GetCandidatesRequestPathVariables } from '../data/dtos/candidate.dto';
import {
  GetRoute,
  Request,
  RouteHandler,
  ValidationResult,
} from '@alien-worlds/aw-core';

import { AjvValidator } from '@src/validator/ajv-validator';
import { CandidatesRequestSchema } from '../schemas';
import { GetCandidatesRouteIO } from './get-candidates.route-io';
import ApiConfig from '@src/config/api-config';

/**
 * @class
 *
 *
 */
export class GetCandidatesRoute extends GetRoute {
  public static create(handler: RouteHandler, config: ApiConfig) {
    return new GetCandidatesRoute(handler, config);
  }

  private constructor(handler: RouteHandler, config: ApiConfig) {
    super(`/${config.urlVersion}/dao/:dacId/candidates`, handler, {
      io: new GetCandidatesRouteIO(),
      validators: {
        request: (
          request: Request<unknown, GetCandidatesRequestPathVariables>
        ): ValidationResult => {
          return AjvValidator.initialize().validateHttpRequest(
            CandidatesRequestSchema,
            request
          );
        },
      },
    });
  }
}
