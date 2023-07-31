import { CreateAggregatedDacRecords } from './domain/use-cases/create-aggregated-dac-records.use-case';
import { DacsController } from './domain/dacs.controller';
import { DependencyInjector } from '@alien-worlds/aw-core';
import { GetAllDacsUseCase } from './domain/use-cases/get-all-dacs.use-case';
import { GetDacInfoUseCase } from './domain/use-cases/get-dac-info.use-case';
import { GetDacTokensUseCase } from './domain/use-cases/get-dac-tokens.use-case';
import { GetDacTreasuryUseCase } from './domain/use-cases/get-dac-treasury.use-case';

export class DacsDependencyInjector extends DependencyInjector {
  public async setup(): Promise<void> {
    const { container } = this;

    container.bind<DacsController>(DacsController.Token).to(DacsController);
    container
      .bind<GetAllDacsUseCase>(GetAllDacsUseCase.Token)
      .to(GetAllDacsUseCase);
    container
      .bind<GetDacTreasuryUseCase>(GetDacTreasuryUseCase.Token)
      .to(GetDacTreasuryUseCase);
    container
      .bind<GetDacInfoUseCase>(GetDacInfoUseCase.Token)
      .to(GetDacInfoUseCase);
    container
      .bind<GetDacTokensUseCase>(GetDacTokensUseCase.Token)
      .to(GetDacTokensUseCase);
    container
      .bind<CreateAggregatedDacRecords>(CreateAggregatedDacRecords.Token)
      .to(CreateAggregatedDacRecords);
  }
}
