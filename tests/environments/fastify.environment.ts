import { TestEnvironment, TestHooks } from './test-environment';

import { buildAPIServer } from '../../src/eosdac-api';
import { TestEnvironmentServer } from './api-test-environment';

export class FastifyTestEnvironment implements TestEnvironment {
	private _server;

	get server(): TestEnvironmentServer {
		return this._server;
	}

	initialize(hooks?: TestHooks) {
		beforeAll(async () => {
			this._server = await buildAPIServer();
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
