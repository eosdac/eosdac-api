import { AsyncContainerModule, Container } from 'inversify';
import {
	bindActionRepository,
	setupAlienWorldsContractService,
	setupDacDirectoryRepository,
	setupDaoWorldsContractService,
	setupFlagRepository,
	setupIndexWorldsContractService,
	setupStateRepository,
	setupTokenWorldsContractService,
	setupWorkerProposalRepository,
} from '@alien-worlds/eosdac-api-common';
import { EosJsRpcSource, MongoClient, MongoSource } from '@alien-worlds/api-core';

import AppConfig from 'src/config/app-config';
import { GetAllDacsUseCase } from './get-dacs/domain/use-cases/get-all-dacs.use-case';
import { GetCurrentBlockUseCase } from './state/domain/use-cases/get-current-block.use-case';
import { GetDacInfoUseCase } from './get-dacs/domain/use-cases/get-dac-info.use-case';
import { GetDacsController } from './get-dacs/domain/get-dacs.controller';
import { GetDacTokensUseCase } from './get-dacs/domain/use-cases/get-dac-tokens.use-case';
import { GetDacTreasuryUseCase } from './get-dacs/domain/use-cases/get-dac-treasury.use-case';
import { GetProfilesUseCase } from './profile/domain/use-cases/get-profiles.use-case';
import { GetProposalsUseCase } from './proposals-counts/domain/use-cases/get-proposals.use-case';
import { GetUserVotingHistoryUseCase } from './voting-history/domain/use-cases/get-user-voting-history.use-case';
import { IsProfileFlaggedUseCase } from './profile/domain/use-cases/is-profile-flagged.use-case';
import { ListProposalsUseCase } from './proposals-inbox/domain/use-cases/list-proposals.use-case';
import { ProfileController } from './profile/domain/profile.controller';
import { ProposalsCountsController } from './proposals-counts/domain/proposals-counts.controller';
import { ProposalsInboxController } from './proposals-inbox/domain/proposals-inbox.controller';
import { setupUserVotingHistoryRepository } from './voting-history';
import { StateController } from './state/domain/state.controller';
import { VotingHistoryController } from './voting-history/domain/voting-history.controller';

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

		const eosJsRpcSource = new EosJsRpcSource(config.eos.endpoint)

		/**
		 * SMART CONTRACT SERVICES
		 */

		await setupIndexWorldsContractService(eosJsRpcSource, container)
		await setupAlienWorldsContractService(eosJsRpcSource, container)
		await setupDaoWorldsContractService(eosJsRpcSource, container)
		await setupTokenWorldsContractService(eosJsRpcSource, container)

		/**
		 * REPOSITORIES
		 */

		await setupStateRepository(mongoSource, container);
		await setupWorkerProposalRepository(mongoSource, container)
		await setupFlagRepository(mongoSource, container)
		await bindActionRepository(mongoSource, container);
		await setupDacDirectoryRepository(mongoSource, eosJsRpcSource, container)
		await setupUserVotingHistoryRepository(mongoSource, container)


		/*bindings*/


		/**
		 * STATE
		 */
		bind<StateController>(StateController.Token).to(StateController);
		bind<GetCurrentBlockUseCase>(GetCurrentBlockUseCase.Token).to(GetCurrentBlockUseCase);


		/**
		 * WORKER PROPOSALS
		 */
		bind<ProposalsCountsController>(ProposalsCountsController.Token).to(ProposalsCountsController);
		bind<GetProposalsUseCase>(GetProposalsUseCase.Token).to(GetProposalsUseCase);

		bind<ProposalsInboxController>(ProposalsInboxController.Token).to(ProposalsInboxController);
		bind<ListProposalsUseCase>(ListProposalsUseCase.Token).to(ListProposalsUseCase);


		/**
		 * ACTIONS
		 */

		bind<ProfileController>(ProfileController.Token).to(ProfileController);
		bind<GetProfilesUseCase>(GetProfilesUseCase.Token).to(GetProfilesUseCase);
		bind<IsProfileFlaggedUseCase>(IsProfileFlaggedUseCase.Token).to(IsProfileFlaggedUseCase);

		/**
		 * DACS
		 */

		bind<GetDacsController>(GetDacsController.Token).to(GetDacsController);
		bind<GetAllDacsUseCase>(GetAllDacsUseCase.Token).to(GetAllDacsUseCase);
		bind<GetDacTreasuryUseCase>(GetDacTreasuryUseCase.Token).to(GetDacTreasuryUseCase);
		bind<GetDacInfoUseCase>(GetDacInfoUseCase.Token).to(GetDacInfoUseCase);
		bind<GetDacTokensUseCase>(GetDacTokensUseCase.Token).to(GetDacTokensUseCase);

		/**
		 * VOTING HISTORY
		 */
		bind<VotingHistoryController>(VotingHistoryController.Token).to(VotingHistoryController);
		bind<GetUserVotingHistoryUseCase>(GetUserVotingHistoryUseCase.Token).to(GetUserVotingHistoryUseCase);
	});

	await container.loadAsync(bindings);
	return container;
};
