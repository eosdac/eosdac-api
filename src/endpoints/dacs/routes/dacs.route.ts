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
 * @class
 */
export class GetDacsRoute extends GetRoute {
  public static create(handler: RouteHandler, config: ApiConfig) {
    return new GetDacsRoute(handler, config);
  }

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
 *
 * @param {Request} request
 * @returns {ValidationResult}
 */
export const validateRequest = (
  request: Request<unknown, object, GetDacsRequestQueryParams>
): ValidationResult => {
  return AjvValidator.initialize().validateHttpRequest(requestSchema, request);
};
