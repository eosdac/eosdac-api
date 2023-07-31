import { PackagedDependencyJsonModel } from '@src/config/config.types';
import {
  DatabaseHealthCheckJsonModel,
  HealthCheckJsonModel,
} from '../../data/dtos/health.dto';
import { Entity } from '@alien-worlds/aw-core';

/**
 * Represents HealthOutput data entity.
 * @class
 */
export class HealthCheckStatus implements Entity {
  public static create(
    version: string,
    dependencies: PackagedDependencyJsonModel,
    databaseHealtCheck: DatabaseHealthCheckJsonModel,
    currentBlockNumber: bigint
  ): HealthCheckStatus {
    return new HealthCheckStatus(
      version,
      databaseHealtCheck,
      currentBlockNumber,
      dependencies
    );
  }

  /**
   * @private
   * @constructor
   */
  private constructor(
    public readonly version: string,
    public readonly databaseHealtCheck: DatabaseHealthCheckJsonModel,
    public readonly currentBlockNumber: bigint,
    public readonly dependencies: PackagedDependencyJsonModel
  ) {}

  public get status(): string {
    return 'OK';
  }

  public get nodeVersion(): string {
    return process.version;
  }

  public get timestamp(): Date {
    return new Date();
  }

  public get uptimeSeconds(): number {
    return Math.floor(process.uptime());
  }
  /**
   * Creates JSON object based on entity data.
   *
   * @public
   * @returns {object}
   */
  public toJSON(): HealthCheckJsonModel {
    const {
      status,
      version,
      timestamp,
      uptimeSeconds,
      nodeVersion,
      currentBlockNumber,
      databaseHealtCheck,
      dependencies,
    } = this;

    return {
      status,
      version,
      timestamp,
      uptimeSeconds,
      nodeVersion,
      dependencies,
      database: databaseHealtCheck,
      historyApi: {
        currentBlockNumber: currentBlockNumber.toString(),
        status: currentBlockNumber < 0 ? 'FAILED' : 'OK',
      },
    };
  }
}
