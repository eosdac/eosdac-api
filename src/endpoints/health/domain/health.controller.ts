import { inject, injectable } from '@alien-worlds/aw-core';
import { GetHealthCheckStatusUseCase } from './use-cases/get-health-check-status.use-case';
import { HealthCheckOutput } from './models/health-check.output';

/**
 * @class
 *
 *
 */
@injectable()
export class HealthController {
  public static Token = 'HEALTH_CONTROLLER';

  constructor(
    @inject(GetHealthCheckStatusUseCase.Token)
    private healthUseCase: GetHealthCheckStatusUseCase
  ) {}

  /**
   *
   * @returns {Promise<HealthCheckOutput>}
   */
  public async healthCheck(): Promise<HealthCheckOutput> {
    const result = await this.healthUseCase.execute();

    return HealthCheckOutput.create(result);
  }
}
