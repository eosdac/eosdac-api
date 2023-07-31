import { Response, RouteIO } from '@alien-worlds/aw-core';
import { HealthCheckOutput } from '../domain/models/health-check.output';

export class HealthCheckRouteIO implements RouteIO {
  public toResponse(output: HealthCheckOutput): Response {
    const { result } = output;
    const status = result.isFailure ? 500 : 200;

    return {
      status,
      body: output.toJSON(),
    };
  }
}
