import { AsyncContainerModule, Container } from 'inversify';

import AppConfig from 'src/config/app-config';
import { bindStateRepository } from '@alien-worlds/eosdac-api-common';
import { GetCurrentBlockUseCase } from './state/domain/use-cases/get-current-block.use-case';
import { MongoClient } from 'mongodb';
import { MongoSource } from '@alien-worlds/api-core';
import { StateController } from './state/domain/state.controller';

/*imports*/

export const setupEndpointDependencies = async (
	container: Container,
	config: AppConfig
): Promise<Container> => {
	const bindings = new AsyncContainerModule(async bind => {
		// async operations first and then binding

		/**
		 * MONGO
		 */
		const { url, dbName } = config.mongo;
		const client = new MongoClient(url);

		/**
		 * MONGO DB (source & repositories)
		 */
		await client.connect();
		const db = client.db(dbName);
		const mongoSource = new MongoSource(db);

		/*bindings*/

		/**
		 * STATE
		 */
		bindStateRepository(container, mongoSource);
		bind<StateController>(StateController.Token).to(StateController);
		bind<GetCurrentBlockUseCase>(GetCurrentBlockUseCase.Token).to(
			GetCurrentBlockUseCase
		);
	});

	await container.loadAsync(bindings);
	return container;
};
