import {
  GetRoute,
  Request,
  RouteHandler,
  ValidationResult,
} from '@alien-worlds/aw-core';

import { AjvValidator } from '@src/validator/ajv-validator';
import { config } from '@config';
import { CustodiansRequestSchema } from '../schemas';
import { GetCustodiansRequestPathVariables } from '../data/dtos/custodian.dto';
import { GetCustodiansRouteIO } from './get-custodians.route-io';
import ApiConfig from '@src/config/api-config';

/**
 * @class
 *
 *
 */
export class GetCustodiansRoute extends GetRoute {
  public static create(handler: RouteHandler, config: ApiConfig) {
    return new GetCustodiansRoute(handler, config);
  }

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
 *
 * @param {Request} request
 * @returns {ValidationResult}
 */
export const validateRequest = (
  request: Request<unknown, GetCustodiansRequestPathVariables>
): ValidationResult => {
  return AjvValidator.initialize().validateHttpRequest(
    CustodiansRequestSchema,
    request
  );
};
