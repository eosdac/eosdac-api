import { inject, injectable, Result } from '@alien-worlds/aw-core';
import { HealthOutput } from './entities/health-output';
import { HealthUseCase } from './use-cases/health.use-case';

/**
 * @class
 *
 *
 */
@injectable()
export class HealthController {
  public static Token = 'HEALTH_CONTROLLER';

  constructor(
    @inject(HealthUseCase.Token)
    private healthUseCase: HealthUseCase
  ) {}

  /**
   *
   * @returns {Promise<Result<HealthOutput, Error>>}
   */
  public async health(): Promise<Result<HealthOutput, Error>> {
    return this.healthUseCase.execute();
  }
}
