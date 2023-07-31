/* eslint-disable sort-imports */
import {
  Response,
  RouteIO,
  Request,
  EntityNotFoundError,
} from '@alien-worlds/aw-core';
import { CandidatesVotersHistoryRequestQueryParams } from '../data/dtos/candidates-voters-history.dto';
import { CandidatesVotersHistoryInput } from '../domain/models/candidates-voters-history.input';
import { CandidatesVotersHistoryOutput } from '../domain/models/candidates-voters-history.output';

/**
 * Represents the RouteIO for handling the input and output of the GetCandidatesVotersHistoryRoute.
 * @class
 */
export class GetCandidatesVotersHistoryRouteIO implements RouteIO {
  /**
   * Converts the CandidatesVotersHistoryOutput to a Response object.
   *
   * @public
   * @param {CandidatesVotersHistoryOutput} output - The CandidatesVotersHistoryOutput to convert.
   * @returns {Response} - The Response object.
   */
  public toResponse(output: CandidatesVotersHistoryOutput): Response {
    const { failure } = output;
    if (failure) {
      const { error } = failure;

      if (error instanceof EntityNotFoundError) {
        return {
          status: 200,
          body: output.toJSON(),
        };
      } else {
        return {
          status: 500,
          body: {
            error: error.message,
          },
        };
      }
    }

    return {
      status: 200,
      body: output.toJSON(),
    };
  }

  /**
   * Converts the Request object to a CandidatesVotersHistoryInput object.
   *
   * @public
   * @param {Request<unknown, object, CandidatesVotersHistoryRequestQueryParams>} request - The Request object to convert.
   * @returns {CandidatesVotersHistoryInput} - The CandidatesVotersHistoryInput object.
   */
  public fromRequest(
    request: Request<unknown, object, CandidatesVotersHistoryRequestQueryParams>
  ): CandidatesVotersHistoryInput {
    const {
      query: { dacId = '', candidateId = '', skip = 0, limit = 20 },
    } = request;

    return new CandidatesVotersHistoryInput(
      dacId.toLowerCase(),
      candidateId.toLowerCase(),
      Number(skip),
      Number(limit)
    );
  }
}
