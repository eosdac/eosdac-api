import { DacAggregateRecord } from './dac-aggregate-record.ts.js';
import {
  IO,
  Result,
  UnknownObject,
  removeUndefinedProperties,
} from '@alien-worlds/aw-core';

export class GetDacsOutput implements IO {
  public static create(result?: Result<DacAggregateRecord[]>): GetDacsOutput {
    return new GetDacsOutput(result, result?.content?.length || 0);
  }

  private constructor(
    public readonly result: Result<DacAggregateRecord[]>,
    public readonly count: number
  ) {}

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
