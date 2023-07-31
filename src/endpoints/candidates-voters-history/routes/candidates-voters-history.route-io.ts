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

export class GetCandidatesVotersHistoryRouteIO implements RouteIO {
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
