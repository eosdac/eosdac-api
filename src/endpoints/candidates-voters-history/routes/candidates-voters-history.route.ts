import { EntityNotFoundError, GetRoute, Request, Result, RouteHandler } from '@alien-worlds/api-core';

import { CandidatesVotersHistoryControllerOutput } from '../data/dtos/candidates-voters-history.dto';
import { CandidatesVotersHistoryInput } from '../domain/models/candidates-voters-history.input';
import { CandidatesVotersHistoryOutput } from '../domain/models/candidates-voters-history.output';

/*imports*/

/**
 * @class
 * 
 * 
 */
export class GetCandidatesVotersHistoryRoute extends GetRoute {
  public static create(handler: RouteHandler) {
    return new GetCandidatesVotersHistoryRoute(handler);
  }

  private constructor(handler: RouteHandler) {
    super('/v1/eosdac/candidates_voters_history', handler, {
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
 * @returns
 */
export const parseRequestToControllerInput = (
  request: Request<CandidatesVotersHistoryInput>
) => {
  // parse DTO (query) to the options required by the controller method
  return CandidatesVotersHistoryInput.fromRequest(request.query);
};

/**
 *
 * @param {Result<CandidatesVotersHistoryControllerOutput>} result
 * @returns
 */
export const parseResultToControllerOutput = (
  result: Result<CandidatesVotersHistoryControllerOutput, Error>
) => {
  if (result.isFailure) {
    const {
      failure: { error },
    } = result;
    if (error) {
      if (error instanceof EntityNotFoundError) {
        return {
          status: 200,
          body: CandidatesVotersHistoryOutput.create({
            results: [],
            total: 0,
          }).toJson()
        }
      } else {
        return {
          status: 500,
          body: {
            error: error.message
          },
        };
      }
    }
  }

  return {
    status: 200,
    body: CandidatesVotersHistoryOutput.create(result.content).toJson(),
  };
};

