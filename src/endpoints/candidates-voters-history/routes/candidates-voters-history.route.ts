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
 * Represents the route for getting candidates' voters history.
 * @class
 */
export class GetCandidatesVotersHistoryRoute extends GetRoute {
  /**
   * Creates a new instance of GetCandidatesVotersHistoryRoute.
   *
   * @public
   * @static
   * @param {RouteHandler} handler - The route handler.
   * @param {ApiConfig} config - The API configuration.
   * @returns {GetCandidatesVotersHistoryRoute} - The created instance of GetCandidatesVotersHistoryRoute.
   */
  public static create(handler: RouteHandler, config: ApiConfig) {
    return new GetCandidatesVotersHistoryRoute(handler, config);
  }

  /**
   * Constructs a new instance of GetCandidatesVotersHistoryRoute.
   *
   * @private
   * @constructor
   * @param {RouteHandler} handler - The route handler.
   * @param {ApiConfig} config - The API configuration.
   */
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
 * Validates the request parameters against the CandidatesVotersHistoryRequestSchema.
 *
 * @param {Request} request - The HTTP request object.
 * @returns {ValidationResult} - The result of the validation.
 */
export const validateRequest = (
  request: Request<unknown, object, CandidatesVotersHistoryRequestQueryParams>
): ValidationResult => {
  return AjvValidator.initialize().validateHttpRequest(
    CandidatesVotersHistoryRequestSchema,
    request
  );
};
