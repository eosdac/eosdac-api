import {
  GetRoute,
  Request,
  RouteHandler,
  ValidationResult,
} from '@alien-worlds/aw-core';

import { AjvValidator } from '@src/validator/ajv-validator';
import { CustodiansRequestSchema } from '../schemas';
import { GetCustodiansRequestPathVariables } from '../data/dtos/custodian.dto';
import { GetCustodiansRouteIO } from './get-custodians.route-io';
import ApiConfig from '@src/config/api-config';

/**
 * Represents the route for getting the list of custodians for a DAC.
 * @class
 */
export class GetCustodiansRoute extends GetRoute {
  /**
   * Creates a new instance of GetCustodiansRoute.
   *
   * @public
   * @static
   * @param {RouteHandler} handler - The route handler function.
   * @param {ApiConfig} config - The API configuration.
   * @returns {GetCustodiansRoute} - The newly created instance of GetCustodiansRoute.
   */
  public static create(handler: RouteHandler, config: ApiConfig) {
    return new GetCustodiansRoute(handler, config);
  }

  /**
   * Constructs a new GetCustodiansRoute instance.
   *
   * @private
   * @constructor
   * @param {RouteHandler} handler - The route handler function.
   * @param {ApiConfig} config - The API configuration.
   */
  private constructor(handler: RouteHandler, config: ApiConfig) {
    super(`/${config.urlVersion}/dao/:dacId/custodians`, handler, {
      io: new GetCustodiansRouteIO(),
      validators: {
        request: validateRequest,
      },
    });
  }
}

/**
 * Validates the request object for the GetCustodiansRoute.
 *
 * @public
 * @param {Request<unknown, GetCustodiansRequestPathVariables>} request - The request object containing path variables.
 * @returns {ValidationResult} - The ValidationResult indicating if the request is valid.
 */
export const validateRequest = (
  request: Request<unknown, GetCustodiansRequestPathVariables>
): ValidationResult => {
  return AjvValidator.initialize().validateHttpRequest(
    CustodiansRequestSchema,
    request
  );
};
