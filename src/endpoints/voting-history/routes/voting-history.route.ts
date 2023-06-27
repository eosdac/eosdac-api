import {
  GetRoute,
  Request,
  Result,
  RouteHandler,
  ValidationResult,
} from '@alien-worlds/api-core';

import { AjvValidator } from '@src/validator/ajv-validator';
import { config } from '@config';
import { UserVote } from '../domain/entities/user-vote';
import { VotingHistoryInput } from '../domain/models/voting-history.input';
import { VotingHistoryOutput } from '../domain/models/voting-history.output';
import { VotingHistoryRequestQueryParams } from '../data/dtos/user-voting-history.dto';
import { VotingHistoryRequestSchema } from '../schemas';

config;
/**
 * @class
 *
 *
 */
export class GetVotingHistoryRoute extends GetRoute {
  public static create(handler: RouteHandler) {
    return new GetVotingHistoryRoute(handler);
  }

  private constructor(handler: RouteHandler) {
    super(
      [
        `/${config.version}/dao/voting_history`,
        `/${config.version}/eosdac/voting_history`,
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
  request: Request<VotingHistoryInput>
): ValidationResult => {
  return AjvValidator.initialize().validateHttpRequest(
    VotingHistoryRequestSchema,
    request
  );
};

/**
 *
 * @param {Request} request
 * @returns
 */
export const parseRequestToControllerInput = (
  request: Request<unknown, object, VotingHistoryRequestQueryParams>
) => {
  // parse DTO (query) to the options required by the controller method
  return VotingHistoryInput.fromRequest(request);
};

/**
 *
 * @param {Result<VotingHistoryOutput>} result
 * @returns
 */
export const parseResultToControllerOutput = (
  result: Result<UserVote[], Error>
) => {
  if (result.isFailure) {
    const {
      failure: { error },
    } = result;
    if (error) {
      return {
        status: 500,
        body: {
          error: error.message,
        },
      };
    }
  }

  const { content } = result;

  return {
    status: 200,
    body: VotingHistoryOutput.create(content).toJson(),
  };
};
