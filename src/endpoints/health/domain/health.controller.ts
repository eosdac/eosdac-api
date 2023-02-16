
import { inject, injectable, Result } from '@alien-worlds/api-core';
import { HealthOutput } from './entities/health-output';
import { HealthUseCase } from './use-cases/health.use-case';
/*imports*/

/**
 * @class
 * 
 * 
 */
@injectable()
export class HealthController {
  public static Token = 'HEALTH_CONTROLLER';

  constructor(
    @inject(HealthUseCase.Token) private healthUseCase: HealthUseCase
    /*injections*/
  ) { }

  /*methods*/

  /**
   * 
   * @returns {Promise<Result<HealthOutput, Error>>}
   */
  public async health(): Promise<Result<HealthOutput, Error>> {
    return this.healthUseCase.execute();
  }
}

