import { GetRoute, RouteHandler } from '@alien-worlds/aw-core';
import { GetPingRouteIO } from './ping.route-io';
import ApiConfig from '../../../config/api-config';

export class GetPingRoute extends GetRoute {
  public static create(handler: RouteHandler, config: ApiConfig) {
    return new GetPingRoute(handler, config);
  }

  private constructor(handler: RouteHandler, config: ApiConfig) {
    super(`/${config.urlVersion}/dao/ping`, handler, {
      io: new GetPingRouteIO(),
    });
  }
}
