import { GetRoute, RouteHandler } from '@alien-worlds/aw-core';
import { HealthCheckRouteIO } from './health-check.route-io';
import ApiConfig from '@src/config/api-config';

/**
 * @class
 */
export class HealthCheckRoute extends GetRoute {
  public static create(handler: RouteHandler, config: ApiConfig) {
    return new HealthCheckRoute(handler, config);
  }

  private constructor(handler: RouteHandler, config: ApiConfig) {
    super(`/${config.urlVersion}/dao/health`, handler, {
      io: new HealthCheckRouteIO(),
    });
  }
}
