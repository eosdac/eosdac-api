import { AsyncContainerModule, Container } from '@alien-worlds/aw-core';
import {
  setupDaoWorldsActionRepository,
  setupDaoWorldsContractService,
  setupDaoWorldsDeltaRepository,
} from '@alien-worlds/aw-contract-dao-worlds';

import { AntelopeRpcSourceImpl } from '@alien-worlds/aw-antelope';
import AppConfig from 'src/config/app-config';
import { CandidatesController } from './candidates/domain/candidates.controller';
import { CandidatesVotersHistoryController } from './candidates-voters-history/domain/candidates-voters-history.controller';
import { CountVotersHistoryUseCase } from './candidates-voters-history/domain/use-cases/count-voters-history.use-case';
import { CustodiansController } from './custodians/domain/custodians.controller';
import { GetAllDacsUseCase } from './get-dacs/domain/use-cases/get-all-dacs.use-case';
import { GetCandidatesUseCase } from './candidates/domain/use-cases/get-candidates.use-case';
import { GetCandidatesVotersHistoryUseCase } from './candidates-voters-history/domain/use-cases/get-candidates-voters-history.use-case';
import { GetCurrentBlockUseCase } from './health/domain/use-cases/get-current-block.use-case';
import { GetCustodiansUseCase } from './custodians/domain/use-cases/get-custodians.use-case';
import { GetDacInfoUseCase } from './get-dacs/domain/use-cases/get-dac-info.use-case';
import { GetDacsController } from './get-dacs/domain/get-dacs.controller';
import { GetDacTokensUseCase } from './get-dacs/domain/use-cases/get-dac-tokens.use-case';
import { GetDacTreasuryUseCase } from './get-dacs/domain/use-cases/get-dac-treasury.use-case';
import { GetMembersAgreedTermsUseCase } from './candidates/domain/use-cases/get-members-agreed-terms.use-case';
import { GetMemberTermsUseCase } from './candidates/domain/use-cases/get-member-terms.use-case';
import { GetProfilesUseCase } from './profile/domain/use-cases/get-profiles.use-case';
import { GetUserVotingHistoryUseCase } from './voting-history/domain/use-cases/get-user-voting-history.use-case';
import { GetVotedCandidateIdsUseCase } from './candidates/domain/use-cases/get-voted-candidate-ids.use-case';
import { GetVotingPowerUseCase } from './candidates-voters-history/domain/use-cases/get-voting-power.use-case';
import { HealthController } from './health/domain/health.controller';
import { HealthUseCase } from './health/domain/use-cases/health.use-case';
import { IsProfileFlaggedUseCase } from './profile/domain/use-cases/is-profile-flagged.use-case';
import { ListCandidateProfilesUseCase } from './candidates/domain/use-cases/list-candidate-profiles.use-case';
import { ListCustodianProfilesUseCase } from './custodians/domain/use-cases/list-custodian-profiles.use-case';
import { MongoSource } from '@alien-worlds/aw-storage-mongodb';
import { ProfileController } from './profile/domain/profile.controller';
import { setupAlienWorldsContractService } from '@alien-worlds/aw-contract-alien-worlds';
import { setupFlagRepository } from './profile/ioc.config';
import { setupIndexWorldsContractService } from '@alien-worlds/aw-contract-index-worlds';
import { setupStkvtWorldsDeltaRepository } from '@alien-worlds/aw-contract-stkvt-worlds';
import { setupTokenWorldsContractService } from '@alien-worlds/aw-contract-token-worlds';
import { VotingHistoryController } from './voting-history/domain/voting-history.controller';

export const setupEndpointDependencies = async (
  container: Container,
  config: AppConfig
): Promise<Container> => {
  const bindings = new AsyncContainerModule(async bind => {
    // async operations first and then binding

    /**
     * MONGO
     */
    const mongoSource = await MongoSource.create(config.mongo);

    const eosJsRpcSource = new AntelopeRpcSourceImpl(config.eos.endpoint);

    /**
     * SMART CONTRACT SERVICES
     */

    await setupIndexWorldsContractService(
      eosJsRpcSource,
      config.eos.hyperionUrl,
      container
    );

    await setupAlienWorldsContractService(
      eosJsRpcSource,
      config.eos.hyperionUrl,
      container
    );

    await setupDaoWorldsContractService(
      eosJsRpcSource,
      config.eos.hyperionUrl,
      container
    );

    await setupTokenWorldsContractService(
      eosJsRpcSource,
      config.eos.hyperionUrl,
      container
    );

    /**
     * REPOSITORIES
     */

    await setupDaoWorldsActionRepository(mongoSource, container);
    await setupDaoWorldsDeltaRepository(mongoSource, container);
    await setupStkvtWorldsDeltaRepository(mongoSource, container);
    await setupFlagRepository(mongoSource, container);

    /**
     * HEALTH
     */
    bind<HealthController>(HealthController.Token).to(HealthController);
    bind<HealthUseCase>(HealthUseCase.Token).to(HealthUseCase);
    bind<GetCurrentBlockUseCase>(GetCurrentBlockUseCase.Token).to(
      GetCurrentBlockUseCase
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
    bind<GetDacTreasuryUseCase>(GetDacTreasuryUseCase.Token).to(
      GetDacTreasuryUseCase
    );
    bind<GetDacInfoUseCase>(GetDacInfoUseCase.Token).to(GetDacInfoUseCase);
    bind<GetDacTokensUseCase>(GetDacTokensUseCase.Token).to(
      GetDacTokensUseCase
    );

    /**
     * VOTING HISTORY
     */
    bind<VotingHistoryController>(VotingHistoryController.Token).to(
      VotingHistoryController
    );
    bind<GetUserVotingHistoryUseCase>(GetUserVotingHistoryUseCase.Token).to(
      GetUserVotingHistoryUseCase
    );

    bind<CandidatesVotersHistoryController>(
      CandidatesVotersHistoryController.Token
    ).to(CandidatesVotersHistoryController);
    bind<GetCandidatesVotersHistoryUseCase>(
      GetCandidatesVotersHistoryUseCase.Token
    ).to(GetCandidatesVotersHistoryUseCase);
    bind<CountVotersHistoryUseCase>(CountVotersHistoryUseCase.Token).to(
      CountVotersHistoryUseCase
    );
    bind<GetVotingPowerUseCase>(GetVotingPowerUseCase.Token).to(
      GetVotingPowerUseCase
    );

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
