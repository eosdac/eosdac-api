import { inject, injectable, Result, UseCase } from '@alien-worlds/api-core';

import { HealthOutput } from '../entities/health-output';
import { HealthOutputDocument } from '../../data/dtos/health.dto';
import { StateRepository } from '../repositories/state.repository';

/*imports*/
/**
 * @class
 */
@injectable()
export class HealthUseCase implements UseCase<HealthOutput> {
  public static Token = 'HEALTH_USE_CASE';

  constructor(/*injections*/
    @inject(StateRepository.Token)
    private stateRepository: StateRepository
  ) { }

  /**
   * @async
   * @returns {Promise<Result<HealthOutput>>}
   */
  public async execute(): Promise<Result<HealthOutput>> {
    const getCurrentBlockRes = await this.stateRepository.getCurrentBlock();

    if (getCurrentBlockRes.isFailure) {
      return Result.withFailure(getCurrentBlockRes.failure)
    }

    const output: HealthOutputDocument = {
      // api
      status: 'OK',
      version: process.env.npm_package_version,

      // server
      timestamp: new Date(),
      uptimeSeconds: Math.floor(process.uptime()),
      nodeVersion: process.version,

      dependencies: [
        {
          name: '@alien-worlds/api-core',
          version: process.env.npm_package_dependencies__alien_worlds_api_core
        },
        {
          name: '@alien-worlds/eosdac-api-common',
          version: process.env.npm_package_dependencies__alien_worlds_eosdac_api_common
        }
      ],

      database: {
        status: 'OK',
      },

      blockChainHistory: {
        currentBlock: getCurrentBlockRes.content.currentBlock,
      },
    };

    return Result.withContent(HealthOutput.fromDto(output));
  }

  /*methods*/
}

