import { DacAggregateRecord } from './dac-aggregate-record';
import {
  IO,
  Result,
  UnknownObject,
  removeUndefinedProperties,
} from '@alien-worlds/aw-core';

/**
 * The `GetDacsOutput` class represents the output data for fetching DACs.
 * @class
 */
export class GetDacsOutput implements IO {
  /**
   * Creates an instance of `GetDacsOutput` with the specified result and count.
   * @param {Result<DacAggregateRecord[]>} result - List of aggregated Dac data.
   * @returns {GetDacsOutput} - The `GetDacsOutput` instance with the provided parameters.
   */
  public static create(result?: Result<DacAggregateRecord[]>): GetDacsOutput {
    return new GetDacsOutput(result, result?.content?.length || 0);
  }

  /**
   * @private
   * @constructor
   * @param {Result<DacAggregateRecord[]>} result - List of aggregated Dac data.
   * @param {number} count - The count of DACs fetched.
   */
  private constructor(
    public readonly result: Result<DacAggregateRecord[]>,
    public readonly count: number
  ) {}

  /**
   * Converts the `GetDacsOutput` into a JSON representation.
   * @returns {UnknownObject} - The JSON representation of the `GetDacsOutput`.
   */
  public toJSON(): UnknownObject {
    const { count, result } = this;

    if (result.isFailure) {
      return { results: [], count: 0 };
    }

    const json = {
      results: result.content.map(dac =>
        removeUndefinedProperties(dac.toJSON())
      ),
      count,
    };

    return removeUndefinedProperties(json);
  }
}
