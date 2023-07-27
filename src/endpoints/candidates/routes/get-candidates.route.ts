import {
  GetCandidatesRequestPathVariables,
  GetCandidatesRequestQueryParams,
} from '../data/dtos/candidate.dto';
import {
  GetRoute,
  Request,
  Result,
  RouteHandler,
  ValidationResult,
} from '@alien-worlds/aw-core';

import { AjvValidator } from '@src/validator/ajv-validator';
import { CandidatesRequestSchema } from '../schemas';
import { config } from '@config';
import { GetCandidatesInput } from '../domain/models/get-candidates.input';
import { GetCandidatesOutput } from '../domain/models/get-candidates.output';

/**
 * @class
 *
 *
 */
export class GetCandidatesRoute extends GetRoute {
  public static create(handler: RouteHandler) {
    return new GetCandidatesRoute(handler);
  }

  private constructor(handler: RouteHandler) {
    super(
      [
        `/${config.version}/dao/:dacId/candidates`,
        `/${config.version}/eosdac/:dacId/candidates`,
      ],
      handler,
      {
        validators: {
          request: validateRequest,
        },
        hooks: {
          pre: parseRequestToControllerInput,
          post: parseResultToControllerOutput,
        },
      }
    );
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
    GetCandidatesRequestPathVariables,
    GetCandidatesRequestQueryParams
  >
): ValidationResult => {
  return AjvValidator.initialize().validateHttpRequest(
    CandidatesRequestSchema,
    request
  );
};

/**
 *
 * @param {Request} request
 * @returns
 */
export const parseRequestToControllerInput = (
  request: Request<
    unknown,
    GetCandidatesRequestPathVariables,
    GetCandidatesRequestQueryParams
  >
) => {
  // parse DTO (query) to the options required by the controller method
  return GetCandidatesInput.fromRequest(request);
};

/**
 *
 * @param {Result<GetCandidatesOutput>} result
 * @returns
 */
export const parseResultToControllerOutput = (
  result: Result<GetCandidatesOutput>
) => {
  if (result.isFailure) {
    const {
      failure: { error },
    } = result;
    if (error) {
      return {
        status: 500,
        body: [],
      };
    }
  }

  return {
    status: 200,
    body: result.content.toJSON(),
  };
};
