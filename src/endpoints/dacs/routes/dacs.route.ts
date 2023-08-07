import * as requestSchema from '@endpoints/dacs/schemas/dacs.request.schema.json';
import {
  GetRoute,
  Request,
  RouteHandler,
  ValidationResult,
} from '@alien-worlds/aw-core';
import { AjvValidator } from '@src/validator/ajv-validator';
import { GetDacsRequestQueryParams } from '../data/dtos/dacs.dto';
import { GetDacsRouteIO } from './dacs.route-io';
import ApiConfig from '@src/config/api-config';

/**
 * The `GetDacsRoute` class represents a route for fetching DACs data.
 * It extends the `GetRoute` class, which provides the basic functionality of handling GET requests.
 */
export class GetDacsRoute extends GetRoute {
  /**
   * Creates a new instance of the `GetDacsRoute`.
   * @param {RouteHandler} handler - The route handler.
   * @param {ApiConfig} config - The API configuration.
   */
  public static create(handler: RouteHandler, config: ApiConfig) {
    return new GetDacsRoute(handler, config);
  }

  /**
   * Constructs a new instance of the `GetDacsRoute`.
   * @param {RouteHandler} handler - The route handler.
   * @param {ApiConfig} config - The API configuration.
   */
  private constructor(handler: RouteHandler, config: ApiConfig) {
    super(`/${config.urlVersion}/dao/dacs`, handler, {
      io: new GetDacsRouteIO(),
      validators: {
        request: validateRequest,
      },
    });
  }
}

/**
 * Validates the request data using the AjvValidator and the defined request schema.
 * @param {Request} request - The server's request.
 * @returns {ValidationResult} - The result of the validation.
 */
export const validateRequest = (
  request: Request<unknown, object, GetDacsRequestQueryParams>
): ValidationResult => {
  return AjvValidator.initialize().validateHttpRequest(requestSchema, request);
};
