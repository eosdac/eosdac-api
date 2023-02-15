import {
  BlockChainHistoryHealthDocument,
  DatabaseHealthDocument,
  HealthOutputDocument,
  PackagedDependency
} from '../../data/dtos/health.dto';

import { removeUndefinedProperties } from '@common/utils/dto.utils';

/*imports*/
/**
 * Represents HealthOutput data entity.
 * @class
 */
export class HealthOutput {
  /**
   * @private
   * @constructor
   */
  private constructor(
    public readonly status: string,
    public readonly version: string,
    public readonly timestamp: Date,
    public readonly uptimeSeconds: number,
    public readonly nodeVersion: string,
    public readonly blockChainHistory: BlockChainHistoryHealthDocument,
    public readonly database: DatabaseHealthDocument,
    public readonly dependencies: PackagedDependency[],
  ) { }

  /**
   * Create DTO based on entity data
   *
   * @returns {HealthOutputDocument}
   */
  public toDto(): HealthOutputDocument {
    const dto = {
      status: this.status,
      version: this.version,
      timestamp: this.timestamp,
      uptimeSeconds: this.uptimeSeconds,
      nodeVersion: this.nodeVersion,
      blockChainHistory: this.blockChainHistory,
      database: this.database,
      dependencies: this.dependencies,
    };

    return removeUndefinedProperties<HealthOutputDocument>(dto);
  }

  /**
   * Creates instances of HealthOutput based on a given DTO.
   *
   * @static
   * @public
   * @param {HealthOutputDocument} dto
   * @returns {HealthOutput}
   */
  public static fromDto(dto: HealthOutputDocument): HealthOutput {
    const {
      status,
      version,
      timestamp,
      uptimeSeconds,
      nodeVersion,
      blockChainHistory,
      database,
      dependencies,
    } = dto;
    return new HealthOutput(
      status,
      version,
      timestamp,
      uptimeSeconds,
      nodeVersion,
      blockChainHistory,
      database,
      dependencies,
    );
  }

  /**
   * Creates JSON object based on entity data.
   *
   * @public
   * @returns {object}
   */
  public toJson(): object {
    const {
      status,
      version,
      timestamp,
      uptimeSeconds,
      nodeVersion,
      blockChainHistory,
      database,
      dependencies,
    } = this;

    const dependenciesOutput = {};
    dependencies.forEach(dep => {
      dependenciesOutput[dep.name] = dep.version;
    })

    return {
      status,
      version,
      timestamp: timestamp.getTime(),
      uptimeSeconds,
      nodeVersion,
      dependencies: dependenciesOutput,
      database: {
        status: database.status,
      },
      blockChainHistory: {
        currentBlock: blockChainHistory.currentBlock.toString(),
      },
    };
  }
}

