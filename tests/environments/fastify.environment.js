const { buildAPIServer } = require('../../src/eosdac-api');

class FastifyTestEnvironment {
	#apiServer;

	async initialize(hooks) {
		beforeAll(async () => {
			this.#apiServer = await buildAPIServer();
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

			if (this.#apiServer) {
				await this.#apiServer.close();
			}
		});
	}

	get server() {
		return this.#apiServer;
	}
}

module.exports = { FastifyTestEnvironment };
