import { DependencyInjector } from '@alien-worlds/aw-core';
import { GetMemberTermsUseCase } from './domain/use-cases/get-member-terms.use-case';
import { GetMembersAgreedTermsUseCase } from './domain/use-cases/get-members-agreed-terms.use-case';
import { GetCandidatesUseCase } from './domain/use-cases/get-candidates.use-case';
import { ListCandidateProfilesUseCase } from './domain/use-cases/list-candidate-profiles.use-case';
import { CandidatesController } from './domain/candidates.controller';

/**
 * Represents a dependency injector for setting up the Candidates endpoint dependencies.
 * @class
 * @extends {DependencyInjector}
 */
export class CandidatesDependencyInjector extends DependencyInjector {
  /**
   * Sets up the Candidates endpoint dependencies.
   *
   * @async
   * @public
   * @returns {Promise<void>} - A Promise that resolves once the setup is complete.
   */
  public async setup(): Promise<void> {
    const { container } = this;

    container
      .bind<GetMemberTermsUseCase>(GetMemberTermsUseCase.Token)
      .to(GetMemberTermsUseCase);
    container
      .bind<GetMembersAgreedTermsUseCase>(GetMembersAgreedTermsUseCase.Token)
      .to(GetMembersAgreedTermsUseCase);
    container
      .bind<GetCandidatesUseCase>(GetCandidatesUseCase.Token)
      .to(GetCandidatesUseCase);
    container
      .bind<ListCandidateProfilesUseCase>(ListCandidateProfilesUseCase.Token)
      .to(ListCandidateProfilesUseCase);
    container
      .bind<CandidatesController>(CandidatesController.Token)
      .to(CandidatesController);
  }
}
