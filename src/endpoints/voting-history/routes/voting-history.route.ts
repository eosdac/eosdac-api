import {
  GetRoute,
  Request,
  RouteHandler,
  ValidationResult,
} from '@alien-worlds/aw-core';

import { AjvValidator } from '@src/validator/ajv-validator';
import { VotingHistoryInput } from '../domain/models/voting-history.input';
import { VotingHistoryRequestSchema } from '../schemas';
import { GetVotingHistoryRouteIO } from './voting-history.route-io';
import ApiConfig from '@src/config/api-config';

/**
 * Represents the route for getting voting history data.
 *
 * @class
 * @extends {GetRoute}
 */
export class GetVotingHistoryRoute extends GetRoute {
  /**
   * Creates a new instance of GetVotingHistoryRoute.
   *
   * @static
   * @method
   * @param {RouteHandler} handler - The handler function for the route.
   * @param {ApiConfig} config - The configuration object for the API.
   * @returns {GetVotingHistoryRoute} The newly created GetVotingHistoryRoute instance.
   */
  public static create(handler: RouteHandler, config: ApiConfig) {
    return new GetVotingHistoryRoute(handler, config);
  }

  /**
   * Creates a new instance of GetVotingHistoryRoute.
   *
   * @constructor
   * @private
   * @param {RouteHandler} handler - The handler function for the route.
   * @param {ApiConfig} config - The configuration object for the API.
   */
  private constructor(handler: RouteHandler, config: ApiConfig) {
    super(`/${config.urlVersion}/dao/voting_history`, handler, {
      io: new GetVotingHistoryRouteIO(),
      validators: {
        request: validateRequest,
      },
    });
  }
}

/**
 * Validates the request data for the GetVotingHistoryRoute.
 *
 * @param {Request<VotingHistoryInput>} request - The request object for the GetVotingHistoryRoute.
 * @returns {ValidationResult} The result of the validation.
 */
export const validateRequest = (
  request: Request<VotingHistoryInput>
): ValidationResult => {
  return AjvValidator.initialize().validateHttpRequest(
    VotingHistoryRequestSchema,
    request
  );
};
