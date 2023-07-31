import {
  GetRoute,
  Request,
  RouteHandler,
  ValidationResult,
} from '@alien-worlds/aw-core';

import { AjvValidator } from '@src/validator/ajv-validator';
import { config } from '@config';
import { VotingHistoryInput } from '../domain/models/voting-history.input';
import { VotingHistoryRequestSchema } from '../schemas';
import { GetVotingHistoryRouteIO } from './voting-history.route-io';
import ApiConfig from '@src/config/api-config';

config;
/**
 * @class
 *
 *
 */
export class GetVotingHistoryRoute extends GetRoute {
  public static create(handler: RouteHandler, config: ApiConfig) {
    return new GetVotingHistoryRoute(handler, config);
  }

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
