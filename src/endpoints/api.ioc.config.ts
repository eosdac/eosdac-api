import { AsyncContainerModule, Container } from 'inversify';
import {
	bindActionRepository,
	bindDacSmartContractRepository,
	bindFlagRepository,
	bindStateRepository,
	bindWorkerProposalRepository,
} from '@alien-worlds/eosdac-api-common';
import { EosJsRpcSource, MongoClient, MongoSource } from '@alien-worlds/api-core';

import AppConfig from 'src/config/app-config';
import { GetCurrentBlockUseCase } from './state/domain/use-cases/get-current-block.use-case';
import { GetProfilesUseCase } from './profile/domain/use-cases/get-profiles.use-case';
import { GetProposalsUseCase } from './proposals-counts/domain/use-cases/get-proposals.use-case';
import { IsProfileFlaggedUseCase } from './profile/domain/use-cases/is-profile-flagged.use-case';
import { ListProposalsUseCase } from './proposals-inbox/domain/use-cases/list-proposals.use-case';
import { ProfileController } from './profile/domain/profile.controller';
import { ProposalsCountsController } from './proposals-counts/domain/proposals-counts.controller';
import { ProposalsInboxController } from './proposals-inbox/domain/proposals-inbox.controller';
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
		bind<GetCurrentBlockUseCase>(GetCurrentBlockUseCase.Token).to(GetCurrentBlockUseCase);

		/**
		 * WORKER PROPOSALS
		 */
		bindWorkerProposalRepository(container, mongoSource);

		bind<ProposalsCountsController>(ProposalsCountsController.Token).to(ProposalsCountsController);
		bind<GetProposalsUseCase>(GetProposalsUseCase.Token).to(GetProposalsUseCase);

		bind<ProposalsInboxController>(ProposalsInboxController.Token).to(ProposalsInboxController);
		bind<ListProposalsUseCase>(ListProposalsUseCase.Token).to(ListProposalsUseCase);

		/**
		 * FLAGS
		 */
		bindFlagRepository(container, mongoSource);

		/**
		 * ACTIONS
		 */
		bindActionRepository(container, mongoSource);
		bindDacSmartContractRepository(container, new EosJsRpcSource(config.eos.endpoint), config.eos.dacDirectoryContract);

		bind<ProfileController>(ProfileController.Token).to(ProfileController);
		bind<GetProfilesUseCase>(GetProfilesUseCase.Token).to(GetProfilesUseCase);
		bind<IsProfileFlaggedUseCase>(IsProfileFlaggedUseCase.Token).to(IsProfileFlaggedUseCase);


	});

	await container.loadAsync(bindings);
	return container;
};
