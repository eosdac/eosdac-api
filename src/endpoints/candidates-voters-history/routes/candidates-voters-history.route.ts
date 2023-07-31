import { CandidatesVotersHistoryRequestQueryParams } from '../data/dtos/candidates-voters-history.dto';
import {
  GetRoute,
  Request,
  RouteHandler,
  ValidationResult,
} from '@alien-worlds/aw-core';

import { AjvValidator } from '@src/validator/ajv-validator';
import { CandidatesVotersHistoryRequestSchema } from '../schemas';
import { GetCandidatesVotersHistoryRouteIO } from './candidates-voters-history.route-io';
import ApiConfig from '@src/config/api-config';

/**
 * @class
 *
 *
 */
export class GetCandidatesVotersHistoryRoute extends GetRoute {
  public static create(handler: RouteHandler, config: ApiConfig) {
    return new GetCandidatesVotersHistoryRoute(handler, config);
  }

  private constructor(handler: RouteHandler, config: ApiConfig) {
    super(`/${config.urlVersion}/dao/candidates_voters_history`, handler, {
      io: new GetCandidatesVotersHistoryRouteIO(),
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
  request: Request<unknown, object, CandidatesVotersHistoryRequestQueryParams>
): ValidationResult => {
  return AjvValidator.initialize().validateHttpRequest(
    CandidatesVotersHistoryRequestSchema,
    request
  );
};
