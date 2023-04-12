import * as requestSchema from '@endpoints/get-dacs/schemas/dacs.request.schema.json';

import {
  GetRoute,
  Request,
  Result,
  RouteHandler,
  SmartContractDataNotFoundError,
  ValidationResult,
} from '@alien-worlds/api-core';

import { AjvValidator } from '@src/validator/ajv-validator';
import { GetDacOutput } from '../domain/models/get-dac.output';
import { GetDacsInput } from '../domain/models/dacs.input';
import { GetDacsOutput } from '../domain/models/get-dacs.output';
import { GetDacsRequestQueryParams } from '../data/dtos/dacs.dto';

/*imports*/

/**
 * @class
 *
 *
 */
export class GetDacsRoute extends GetRoute {
  public static create(handler: RouteHandler) {
    return new GetDacsRoute(handler);
  }

  private constructor(handler: RouteHandler) {
    super(['/v1/dao/dacs', '/v1/eosdac/dacs'], handler, {
      validators: {
        request: validateRequest,
      },
      hooks: {
        pre: parseRequestToControllerInput,
        post: parseResultToControllerOutput,
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

/**
 *
 * @param {Request} request
 * @returns {GetDacsInput}
 */
export const parseRequestToControllerInput = (
  request: Request<unknown, object, GetDacsRequestQueryParams>
) => {
  // parse DTO (query) to the options required by the controller method
  return GetDacsInput.fromRequest(request);
};

/**
 *
 * @param {Result<GetDacOutput[]>} result
 * @returns
 */
export const parseResultToControllerOutput = (
  result: Result<GetDacOutput[]>
) => {
  if (result.isFailure) {
    const {
      failure: { error },
    } = result;
    if (error) {
      return {
        status: error instanceof SmartContractDataNotFoundError ? 404 : 500,
        body: {
          error: error.message,
        },
      };
    }
  }

  const { content } = result;

  return {
    status: 200,
    body: GetDacsOutput.create(content).toJson(),
  };
};
