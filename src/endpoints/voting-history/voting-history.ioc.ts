import { DependencyInjector } from '@alien-worlds/aw-core';
import { VotingHistoryController } from './domain/voting-history.controller';
import { GetUserVotingHistoryUseCase } from './domain/use-cases/get-user-voting-history.use-case';

/**
 * Represents a dependency injector for setting up the Dacs endpoint dependencies.
 */
export class VotingHistoryDependencyInjector extends DependencyInjector {
  /**
   * Sets up the dependency injection by binding classes to tokens in the container.
   * @async
   * @returns {Promise<void>}
   */
  public async setup(): Promise<void> {
    const { container } = this;

    container
      .bind<GetUserVotingHistoryUseCase>(GetUserVotingHistoryUseCase.Token)
      .to(GetUserVotingHistoryUseCase);
    container
      .bind<VotingHistoryController>(VotingHistoryController.Token)
      .to(VotingHistoryController);
  }
}
