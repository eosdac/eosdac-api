import {
  Request,
  Response,
  RouteIO,
  SmartContractDataNotFoundError,
} from '@alien-worlds/aw-core';
import { GetDacsRequestQueryParams } from '../data/dtos/dacs.dto';
import { GetDacsInput } from '../domain/models/dacs.input';
import { GetDacsOutput } from '../domain/models/get-dacs.output';

export class GetDacsRouteIO extends RouteIO {
  public toResponse(output: GetDacsOutput): Response {
    const { result } = output;
    if (result.isFailure) {
      const {
        failure: { error },
      } = result;
      return {
        status: error instanceof SmartContractDataNotFoundError ? 404 : 500,
        body: {
          error: error.message,
        },
      };
    }

    return {
      status: 200,
      body: output.toJSON(),
    };
  }

  public fromRequest(
    request: Request<unknown, unknown, GetDacsRequestQueryParams>
  ): GetDacsInput {
    const {
      query: { dacId, limit },
    } = request;
    return GetDacsInput.create(dacId, limit);
  }
}
