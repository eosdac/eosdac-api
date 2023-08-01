import { TestEnvironment, TestHooks } from './test-environment';

import { ApiDependencyInjector } from '@endpoints/api.ioc.config';
import { Container } from '@alien-worlds/aw-core';
import { DaoApi } from '@src/api';
import { TestEnvironmentServer } from './api-test-environment';
import { config } from '@config';
import { mountRoutes } from '@src/routes';

export class FastifyTestEnvironment implements TestEnvironment {
  private _server;

  get server(): TestEnvironmentServer {
    return this._server;
  }

  initialize(hooks?: TestHooks) {
    beforeAll(async () => {
      const ioc = new Container();
      const apiDependencyInjector = new ApiDependencyInjector(ioc);
      await apiDependencyInjector.setup(config);

      const api = new DaoApi(config);
      mountRoutes(api, ioc, config);

      this._server = api.framework;
      if (hooks?.beforeAll) {
        await hooks.beforeAll();
      }
    });

    if (hooks?.beforeEach) {
      beforeEach(async () => await hooks.beforeEach());
    }

    if (hooks?.afterEach) {
      afterEach(async () => await hooks.afterEach());
    }

    afterAll(async () => {
      if (hooks?.afterAll) {
        await hooks.afterAll();
      }
      if (this._server) {
        await this._server.close();
      }
    });
  }
}
