import { DependencyInjector } from '@alien-worlds/aw-core';
import { CandidatesVotersHistoryController } from './domain/candidates-voters-history.controller';
import { GetCandidatesVotersHistoryUseCase } from './domain/use-cases/get-candidates-voters-history.use-case';
import { CountVotersHistoryUseCase } from './domain/use-cases/count-voters-history.use-case';
import { AssignVotingPowerUseCase } from './domain/use-cases/assign-voting-power.use-case';

/**
 * Represents a dependency injector for setting up the Candidates voters history endpoint dependencies.
 * @class
 * @extends {DependencyInjector}
 */
export class CandidatesVotersHistoryDependencyInjector extends DependencyInjector {
  /**
   * Sets up the Candidates voters history endpoint dependencies.
   *
   * @async
   * @public
   * @returns {Promise<void>} - A Promise that resolves once the setup is complete.
   */
  public async setup(): Promise<void> {
    const { container } = this;

    container
      .bind<CandidatesVotersHistoryController>(
        CandidatesVotersHistoryController.Token
      )
      .to(CandidatesVotersHistoryController);
    container
      .bind<GetCandidatesVotersHistoryUseCase>(
        GetCandidatesVotersHistoryUseCase.Token
      )
      .to(GetCandidatesVotersHistoryUseCase);
    container
      .bind<CountVotersHistoryUseCase>(CountVotersHistoryUseCase.Token)
      .to(CountVotersHistoryUseCase);
    container
      .bind<AssignVotingPowerUseCase>(AssignVotingPowerUseCase.Token)
      .to(AssignVotingPowerUseCase);
  }
}
