import { inject, injectable, Result, UseCase } from '@alien-worlds/aw-core';

import { GetCurrentBlockUseCase } from './get-current-block.use-case';
import { HealthOutput } from '../entities/health-output';
import { HealthOutputDocument } from '../../data/dtos/health.dto';

/**
 * @class
 */
@injectable()
export class HealthUseCase implements UseCase<HealthOutput> {
  public static Token = 'HEALTH_USE_CASE';

  constructor(
    @inject(GetCurrentBlockUseCase.Token)
    private getCurrentBlockUseCase: GetCurrentBlockUseCase
  ) {}

  /**
   * @async
   * @returns {Promise<Result<HealthOutput>>}
   */
  public async execute(): Promise<Result<HealthOutput>> {
    const currentBlockRes = await this.getCurrentBlockUseCase.execute();

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
          name: '@alien-worlds/aw-core',
          version: process.env.npm_package_dependencies__alien_worlds_aw_core,
        },
        {
          name: '@alien-worlds/aw-storage-mongodb',
          version:
            process.env
              .npm_package_dependencies__alien_worlds_aw_storage_mongodb,
        },
        {
          name: '@alien-worlds/aw-antelope',
          version:
            process.env.npm_package_dependencies__alien_worlds_aw_antelope,
        },
        {
          name: '@alien-worlds/aw-contract-alien-worlds',
          version:
            process.env
              .npm_package_dependencies__alien_worlds_aw_contract_alien_worlds,
        },
        {
          name: '@alien-worlds/aw-contract-dao-worlds',
          version:
            process.env
              .npm_package_dependencies__alien_worlds_aw_contract_dao_worlds,
        },
        {
          name: '@alien-worlds/aw-contract-index-worlds',
          version:
            process.env
              .npm_package_dependencies__alien_worlds_aw_contract_index_worlds,
        },
        {
          name: '@alien-worlds/aw-contract-stkvt-worlds',
          version:
            process.env
              .npm_package_dependencies__alien_worlds_aw_contract_stkvt_worlds,
        },
        {
          name: '@alien-worlds/aw-contract-token-worlds',
          version:
            process.env
              .npm_package_dependencies__alien_worlds_aw_contract_token_worlds,
        },
      ],

      database: {
        status: 'OK',
      },

      blockChainHistory: {
        currentBlock: !currentBlockRes.isFailure
          ? currentBlockRes.content
          : -1n,
        status: currentBlockRes.isFailure ? 'FAILED' : 'OK',
      },
    };

    return Result.withContent(HealthOutput.fromDto(output));
  }
}
