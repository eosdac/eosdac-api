import { DependencyInjector } from '@alien-worlds/aw-core';
import {
  setupDaoWorldsActionRepository,
  setupDaoWorldsContractService,
  setupDaoWorldsDeltaRepository,
} from '@alien-worlds/aw-contract-dao-worlds';
import { setupAlienWorldsContractService } from '@alien-worlds/aw-contract-alien-worlds';
import { setupIndexWorldsContractService } from '@alien-worlds/aw-contract-index-worlds';
import { setupStkvtWorldsDeltaRepository } from '@alien-worlds/aw-contract-stkvt-worlds';
import { setupTokenWorldsContractService } from '@alien-worlds/aw-contract-token-worlds';
import { AntelopeRpcSourceImpl } from '@alien-worlds/aw-antelope';
import ApiConfig from '@src/config/api-config';
import { MongoSource } from '@alien-worlds/aw-storage-mongodb';
import { DacsDependencyInjector } from './dacs/dacs.ioc';
import { ProfileDependencyInjector } from './profile/profile.ioc';
import { CandidatesVotersHistoryDependencyInjector } from './candidates-voters-history/candidates-voters-history.ioc';
import { CandidatesDependencyInjector } from './candidates/candidates.ioc';
import { CustodiansDependencyInjector } from './custodians/custodians.ioc';
import { HealthDependencyInjector } from './health/health.ioc';
import { VotingHistoryDependencyInjector } from './voting-history/voting-history.ioc';
import { PingDependencyInjector } from './ping/ping.ioc';

export class ApiDependencyInjector extends DependencyInjector {
  public async setup(config: ApiConfig): Promise<void> {
    const { container } = this;
    const mongoSource = await MongoSource.create(config.mongo);
    const antelopeRpcSource = new AntelopeRpcSourceImpl(
      config.antelope.endpoint
    );
    const healthDI = new HealthDependencyInjector(container);
    const pingDI = new PingDependencyInjector(container);
    const profileDI = new ProfileDependencyInjector(container);
    const dacsDI = new DacsDependencyInjector(container);
    const candidateVotersDI = new CandidatesVotersHistoryDependencyInjector(
      container
    );
    const votingHistoryDI = new VotingHistoryDependencyInjector(container);
    const candidatesDI = new CandidatesDependencyInjector(container);
    const custodiansDI = new CustodiansDependencyInjector(container);

    healthDI.setup(config);
    pingDI.setup();
    profileDI.setup(mongoSource);
    dacsDI.setup();
    candidateVotersDI.setup();
    votingHistoryDI.setup();
    candidatesDI.setup();
    custodiansDI.setup();

    /**
     * SMART CONTRACT SERVICES
     */

    await setupIndexWorldsContractService(
      antelopeRpcSource,
      config.antelope.hyperionUrl,
      container
    );

    await setupAlienWorldsContractService(
      antelopeRpcSource,
      config.antelope.hyperionUrl,
      container
    );

    await setupDaoWorldsContractService(
      antelopeRpcSource,
      config.antelope.hyperionUrl,
      container
    );

    await setupTokenWorldsContractService(
      antelopeRpcSource,
      config.antelope.hyperionUrl,
      container
    );

    /**
     * REPOSITORIES
     */

    await setupDaoWorldsActionRepository(mongoSource, container);
    await setupDaoWorldsDeltaRepository(mongoSource, container);
    await setupStkvtWorldsDeltaRepository(mongoSource, container);
  }
}
