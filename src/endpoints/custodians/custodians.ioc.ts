import { DependencyInjector } from '@alien-worlds/aw-core';
import { GetCustodiansUseCase } from './domain/use-cases/get-custodians.use-case';
import { ListCustodianProfilesUseCase } from './domain/use-cases/list-custodian-profiles.use-case';
import { CustodiansController } from './domain/custodians.controller';

export class CustodiansDependencyInjector extends DependencyInjector {
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
