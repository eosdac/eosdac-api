import { GetRoute, Result, RouteHandler } from '@alien-worlds/api-core';

import { HealthOutput } from '../domain/entities/health-output';

/*imports*/

/**
 * @class
 * 
 * 
 */
export class GetHealthRoute extends GetRoute {
  public static create(handler: RouteHandler) {
    return new GetHealthRoute(handler);
  }

  private constructor(handler: RouteHandler) {
    super('/v1/eosdac/health', handler, {
      hooks: {
        post: parseResultToControllerOutput
      }
    });
  }
}

/**
 *
 * @param {Result<HealthOutput[]>} result
 * @returns
 */
export const parseResultToControllerOutput = (
  result: Result<HealthOutput>
) => {
  if (result.isFailure) {
    const { failure: { error } } = result;
    if (error) {
      return {
        status: 500,
        body: {
          status: 'FAIL',
          error: error.message,
        },
      };
    }
  }

  const { content } = result;

  return {
    status: 200,
    body: content.toJson(),
  };
};

