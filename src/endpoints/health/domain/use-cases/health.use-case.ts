import { injectable, Result, UseCase } from '@alien-worlds/api-core';

import { HealthOutput } from '../entities/health-output';
import { HealthOutputDocument } from '../../data/dtos/health.dto';

/**
 * @class
 */
@injectable()
export class HealthUseCase implements UseCase<HealthOutput> {
  public static Token = 'HEALTH_USE_CASE';

  /**
   * @async
   * @returns {Promise<Result<HealthOutput>>}
   */
  public async execute(): Promise<Result<HealthOutput>> {
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
          version: process.env.npm_package_dependencies__alien_worlds_api_core,
        },
        {
          name: '@alien-worlds/storage-mongodb',
          version:
            process.env.npm_package_dependencies__alien_worlds_storage_mongodb,
        },
        {
          name: '@alien-worlds/eos',
          version: process.env.npm_package_dependencies__alien_worlds_eos,
        },
        {
          name: '@alien-worlds/eosio-contract-types',
          version:
            process.env
              .npm_package_dependencies__alien_worlds_eosio_contract_types,
        },
        {
          name: '@alien-worlds/alien-worlds-common',
          version:
            process.env
              .npm_package_dependencies__alien_worlds_alien_worlds_common,
        },
        {
          name: '@alien-worlds/dao-worlds-common',
          version:
            process.env
              .npm_package_dependencies__alien_worlds_dao_worlds_common,
        },
        {
          name: '@alien-worlds/index-worlds-common',
          version:
            process.env
              .npm_package_dependencies__alien_worlds_index_worlds_common,
        },
        {
          name: '@alien-worlds/stkvt-worlds-common',
          version:
            process.env
              .npm_package_dependencies__alien_worlds_stkvt_worlds_common,
        },
        {
          name: '@alien-worlds/token-worlds-common',
          version:
            process.env
              .npm_package_dependencies__alien_worlds_token_worlds_common,
        },
      ],

      database: {
        status: 'OK',
      },

      blockChainHistory: {
        currentBlock: -1n, // TODO: update current block after reading from history tools API
      },
    };

    return Result.withContent(HealthOutput.fromDto(output));
  }
}
