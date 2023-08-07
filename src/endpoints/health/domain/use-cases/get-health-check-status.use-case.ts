import { inject, injectable, Result, UseCase } from '@alien-worlds/aw-core';
import { HealthCheckStatus } from '../entities/health-check-status';
import { HistoryService } from '../services/history.service';
import { DatabaseService } from '../services/database.service';
import ApiConfig from '@src/config/api-config';

/**
 * @class
 */
@injectable()
export class GetHealthCheckStatusUseCase implements UseCase<HealthCheckStatus> {
  public static Token = 'GET_HEALTH_CHECK_STATUS_USE_CASE';

  constructor(
    @inject(ApiConfig.Token)
    private appConfig: ApiConfig,
    @inject(HistoryService.Token)
    private historyService: HistoryService,
    @inject(DatabaseService.Token)
    private databaseService: DatabaseService
  ) {}

  /**
   * @async
   * @returns {Promise<Result<HealthCheckStatus>>}
   */
  public async execute(): Promise<Result<HealthCheckStatus>> {
    const { content: currentBlockNumber = -1n } =
      await this.historyService.getCurrentBlockNumber();
    const { content: databaseConnectionStats } =
      await this.databaseService.checkConnection();
    const { version, dependencies } = this.appConfig;

    const status = HealthCheckStatus.create(
      version,
      dependencies,
      databaseConnectionStats,
      currentBlockNumber
    );

    return Result.withContent(status);
  }
}
