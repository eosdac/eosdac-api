import { IO, Result } from '@alien-worlds/aw-core';
import { HealthCheckStatus } from '../entities/health-check-status';

export class HealthCheckOutput implements IO {
  public static create(result: Result<HealthCheckStatus>): HealthCheckOutput {
    return new HealthCheckOutput(result);
  }

  constructor(public readonly result: Result<HealthCheckStatus>) {}

  public toJSON() {
    const { result } = this;

    if (result.isFailure) {
      return {
        status: 'FAIL',
        error: result.failure.error.message,
      };
    }

    const { content } = result;

    return content.toJSON();
  }
}
