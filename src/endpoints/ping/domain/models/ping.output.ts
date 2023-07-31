import { IO, Result } from '@alien-worlds/aw-core';

export class PingOutput implements IO {
  private constructor(public readonly result: Result<string>) {}

  public static create(result: Result<string>): PingOutput {
    return new PingOutput(result);
  }

  public toJSON() {
    const { result } = this;

    if (result.isFailure) {
      return {};
    }

    return {
      ping: result.content,
    };
  }
}
