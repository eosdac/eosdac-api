import { Container, Route } from '@alien-worlds/aw-core';

import ApiConfig from './config/api-config';
import { CandidatesController } from '@endpoints/candidates/domain/candidates.controller';
import { CandidatesVotersHistoryController } from '@endpoints/candidates-voters-history/domain/candidates-voters-history.controller';
import { CustodiansController } from '@endpoints/custodians/domain/custodians.controller';
import { DacsController } from '@endpoints/dacs/domain/dacs.controller';
import { DaoApi } from './api';
import { GetCandidatesRoute } from '@endpoints/candidates/routes/get-candidates.route';
import { GetCandidatesVotersHistoryRoute } from '@endpoints/candidates-voters-history/routes/candidates-voters-history.route';
import { GetCustodiansRoute } from '@endpoints/custodians/routes/get-custodians.route';
import { GetDacsRoute } from '@endpoints/dacs/routes/dacs.route';
import { GetPingRoute } from './endpoints/ping/routes/ping.route';
import { GetProfileRoute } from '@endpoints/profile/routes/get-profile.route';
import { GetVotingHistoryRoute } from '@endpoints/voting-history/routes/voting-history.route';
import { HealthCheckRoute } from '@endpoints/health/routes/health-check.route';
import { HealthController } from '@endpoints/health/domain/health.controller';
import { PingController } from '@endpoints/ping';
import { ProfileController } from '@endpoints/profile/domain/profile.controller';
import { VotingHistoryController } from '@endpoints/voting-history/domain/voting-history.controller';

export const mountRoutes = (
  api: DaoApi,
  container: Container,
  config: ApiConfig
) => {
  const pingController = container.get<PingController>(PingController.Token);
  const healthController: HealthController = container.get<HealthController>(
    HealthController.Token
  );
  const profileController: ProfileController = container.get<ProfileController>(
    ProfileController.Token
  );
  const getDacsController: DacsController = container.get<DacsController>(
    DacsController.Token
  );
  const votingHistoryController: VotingHistoryController =
    container.get<VotingHistoryController>(VotingHistoryController.Token);
  const candidatesVotersHistoryController: CandidatesVotersHistoryController =
    container.get<CandidatesVotersHistoryController>(
      CandidatesVotersHistoryController.Token
    );
  const candidatesController: CandidatesController =
    container.get<CandidatesController>(CandidatesController.Token);
  const custodiansController: CustodiansController =
    container.get<CustodiansController>(CustodiansController.Token);

  //

  Route.mount(
    api.framework,
    GetProfileRoute.create(
      profileController.getProfile.bind(profileController),
      config
    )
  );

  Route.mount(
    api.framework,
    GetDacsRoute.create(
      getDacsController.getDacs.bind(getDacsController),
      config
    )
  );

  Route.mount(
    api.framework,
    GetVotingHistoryRoute.create(
      votingHistoryController.votingHistory.bind(votingHistoryController),
      config
    )
  );

  Route.mount(
    api.framework,
    GetCandidatesVotersHistoryRoute.create(
      candidatesVotersHistoryController.candidatesVotersHistory.bind(
        candidatesVotersHistoryController
      ),
      config
    )
  );

  Route.mount(
    api.framework,
    GetCandidatesRoute.create(
      candidatesController.list.bind(candidatesController),
      config
    )
  );

  Route.mount(
    api.framework,
    GetCustodiansRoute.create(
      custodiansController.list.bind(custodiansController),
      config
    )
  );

  Route.mount(
    api.framework,
    HealthCheckRoute.create(
      healthController.healthCheck.bind(healthController),
      config
    )
  );

  Route.mount(
    api.framework,
    GetPingRoute.create(pingController.ping.bind(pingController), config)
  );
};
