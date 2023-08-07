import { DependencyInjector } from '@alien-worlds/aw-core';
import ApiConfig from '@src/config/api-config';
import { HealthController } from './domain/health.controller';
import { GetHealthCheckStatusUseCase } from './domain/use-cases/get-health-check-status.use-case';
import { DatabaseService } from './domain/services/database.service';
import { DatabaseServiceImpl } from './data/services/database.service-impl';
import { HistoryService } from './domain/services/history.service';
import { HistoryServiceImpl } from './data/services/history.service-impl';

export class HealthDependencyInjector extends DependencyInjector {
  public async setup(config: ApiConfig): Promise<void> {
    const { container } = this;

    container.bind<ApiConfig>(ApiConfig.Token).toConstantValue(config);
    container
      .bind<DatabaseService>(DatabaseService.Token)
      .toConstantValue(new DatabaseServiceImpl(config));
    container
      .bind<HistoryService>(HistoryService.Token)
      .toConstantValue(new HistoryServiceImpl(config));
    container
      .bind<GetHealthCheckStatusUseCase>(GetHealthCheckStatusUseCase.Token)
      .to(GetHealthCheckStatusUseCase);
    container
      .bind<HealthController>(HealthController.Token)
      .to(HealthController);
  }
}
