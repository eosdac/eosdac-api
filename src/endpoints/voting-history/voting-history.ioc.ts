import { DependencyInjector } from '@alien-worlds/aw-core';
import { VotingHistoryController } from './domain/voting-history.controller';
import { GetUserVotingHistoryUseCase } from './domain/use-cases/get-user-voting-history.use-case';

export class VotingHistoryDependencyInjector extends DependencyInjector {
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
