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
import {
	EosJsRpcSource,
	MongoClient,
	MongoSource,
} from '@alien-worlds/api-core';

import AppConfig from 'src/config/app-config';
import { CandidatesController } from './candidates/domain/candidates.controller';
import { CandidatesVotersHistoryController } from './candidates-voters-history/domain/candidates-voters-history.controller';
import { CountVotersHistoryUseCase } from './candidates-voters-history/domain/use-cases/count-voters-history.use-case';
import { CustodiansController } from './custodians/domain/custodians.controller';
import { GetAllDacsUseCase } from './get-dacs/domain/use-cases/get-all-dacs.use-case';
import { GetCandidatesUseCase } from './candidates/domain/use-cases/get-candidates.use-case';
import { GetCandidatesVotersHistoryUseCase } from './candidates-voters-history/domain/use-cases/get-candidates-voters-history.use-case';
import { GetCurrentBlockUseCase } from './state/domain/use-cases/get-current-block.use-case';
import { GetCustodiansUseCase } from './custodians/domain/use-cases/get-custodians.use-case';
import { GetDacInfoUseCase } from './get-dacs/domain/use-cases/get-dac-info.use-case';
import { GetDacsController } from './get-dacs/domain/get-dacs.controller';
import { GetDacTokensUseCase } from './get-dacs/domain/use-cases/get-dac-tokens.use-case';
import { GetDacTreasuryUseCase } from './get-dacs/domain/use-cases/get-dac-treasury.use-case';
import { GetMembersAgreedTermsUseCase } from './candidates/domain/use-cases/get-members-agreed-terms.use-case';
import { GetMemberTermsUseCase } from './candidates/domain/use-cases/get-member-terms.use-case';
import { GetProfilesUseCase } from './profile/domain/use-cases/get-profiles.use-case';
import { GetProposalsUseCase } from './proposals-counts/domain/use-cases/get-proposals.use-case';
import { GetUserVotingHistoryUseCase } from './voting-history/domain/use-cases/get-user-voting-history.use-case';
import { GetVotedCandidateIdsUseCase } from './candidates/domain/use-cases/get-voted-candidate-ids.use-case';
import { GetVotingPowerUseCase } from './candidates-voters-history/domain/use-cases/get-voting-power.use-case';
import { IsProfileFlaggedUseCase } from './profile/domain/use-cases/is-profile-flagged.use-case';
import { ListCandidateProfilesUseCase } from './candidates/domain/use-cases/list-candidate-profiles.use-case';
import { ListCustodianProfilesUseCase } from './custodians/domain/use-cases/list-custodian-profiles.use-case';
import { ListProposalsUseCase } from './proposals-inbox/domain/use-cases/list-proposals.use-case';
import { ProfileController } from './profile/domain/profile.controller';
import { ProposalsCountsController } from './proposals-counts/domain/proposals-counts.controller';
import { ProposalsInboxController } from './proposals-inbox/domain/proposals-inbox.controller';
import { setupUserVotingHistoryRepository } from './voting-history';
import { setupVotingWeightRepository } from './candidates-voters-history/ioc.config';
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

		const eosJsRpcSource = new EosJsRpcSource(config.eos.endpoint);

		/**
		 * SMART CONTRACT SERVICES
		 */

		await setupIndexWorldsContractService(eosJsRpcSource, container);
		await setupAlienWorldsContractService(eosJsRpcSource, container);
		await setupDaoWorldsContractService(eosJsRpcSource, container);
		await setupTokenWorldsContractService(eosJsRpcSource, container);

		/**
		 * REPOSITORIES
		 */

		await setupStateRepository(mongoSource, container);
		await setupWorkerProposalRepository(mongoSource, container);
		await setupFlagRepository(mongoSource, container);
		await bindActionRepository(mongoSource, container);
		await setupDacDirectoryRepository(mongoSource, eosJsRpcSource, container)
		await setupUserVotingHistoryRepository(mongoSource, container)
		await setupVotingWeightRepository(mongoSource, container);
		/*bindings*/

		/**
		 * STATE
		 */
		bind<StateController>(StateController.Token).to(StateController);
		bind<GetCurrentBlockUseCase>(GetCurrentBlockUseCase.Token).to(
			GetCurrentBlockUseCase
		);

		/**
		 * WORKER PROPOSALS
		 */
		bind<ProposalsCountsController>(ProposalsCountsController.Token).to(
			ProposalsCountsController
		);
		bind<GetProposalsUseCase>(GetProposalsUseCase.Token).to(
			GetProposalsUseCase
		);

		bind<ProposalsInboxController>(ProposalsInboxController.Token).to(
			ProposalsInboxController
		);
		bind<ListProposalsUseCase>(ListProposalsUseCase.Token).to(
			ListProposalsUseCase
		);

		/**
		 * ACTIONS
		 */

		bind<ProfileController>(ProfileController.Token).to(ProfileController);
		bind<GetProfilesUseCase>(GetProfilesUseCase.Token).to(GetProfilesUseCase);
		bind<IsProfileFlaggedUseCase>(IsProfileFlaggedUseCase.Token).to(
			IsProfileFlaggedUseCase
		);

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

		bind<CandidatesVotersHistoryController>(CandidatesVotersHistoryController.Token).to(CandidatesVotersHistoryController);
		bind<GetCandidatesVotersHistoryUseCase>(GetCandidatesVotersHistoryUseCase.Token).to(GetCandidatesVotersHistoryUseCase);
		bind<CountVotersHistoryUseCase>(CountVotersHistoryUseCase.Token).to(CountVotersHistoryUseCase);
		bind<GetVotingPowerUseCase>(GetVotingPowerUseCase.Token).to(GetVotingPowerUseCase);

		/**
		 * CANDIDATES
		 */
		bind<GetMemberTermsUseCase>(GetMemberTermsUseCase.Token).to(
			GetMemberTermsUseCase
		);
		bind<GetMembersAgreedTermsUseCase>(GetMembersAgreedTermsUseCase.Token).to(
			GetMembersAgreedTermsUseCase
		);
		bind<GetVotedCandidateIdsUseCase>(GetVotedCandidateIdsUseCase.Token).to(
			GetVotedCandidateIdsUseCase
		);
		bind<GetCandidatesUseCase>(GetCandidatesUseCase.Token).to(
			GetCandidatesUseCase
		);
		bind<ListCandidateProfilesUseCase>(ListCandidateProfilesUseCase.Token).to(
			ListCandidateProfilesUseCase
		);
		bind<CandidatesController>(CandidatesController.Token).to(
			CandidatesController
		);

		/**
		 * CUSTODIANS
		 */
		bind<GetCustodiansUseCase>(GetCustodiansUseCase.Token).to(
			GetCustodiansUseCase
		);
		bind<ListCustodianProfilesUseCase>(ListCustodianProfilesUseCase.Token).to(
			ListCustodianProfilesUseCase
		);
		bind<CustodiansController>(CustodiansController.Token).to(
			CustodiansController
		);
	});

	await container.loadAsync(bindings);
	return container;
};
