import { DependencyInjector } from '@alien-worlds/aw-core';
import { GetCustodiansUseCase } from './domain/use-cases/get-custodians.use-case';
import { ListCustodianProfilesUseCase } from './domain/use-cases/list-custodian-profiles.use-case';
import { CustodiansController } from './domain/custodians.controller';

/**
 * Represents a dependency injector for setting up the Custodians endpoint dependencies.
 */
export class CustodiansDependencyInjector extends DependencyInjector {
  /**
   * Sets up the dependency injection by binding classes to tokens in the container.
   * @async
   * @returns {Promise<void>}
   */
  public async setup(): Promise<void> {
    const { container } = this;

    container
      .bind<GetCustodiansUseCase>(GetCustodiansUseCase.Token)
      .to(GetCustodiansUseCase);
    container
      .bind<ListCustodianProfilesUseCase>(ListCustodianProfilesUseCase.Token)
      .to(ListCustodianProfilesUseCase);
    container
      .bind<CustodiansController>(CustodiansController.Token)
      .to(CustodiansController);
  }
}
