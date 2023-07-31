import { IO, UnknownObject } from '@alien-worlds/aw-core';

/**
 * @class
 */
export class GetDacsInput implements IO {
  
  public static create(dacId: string, limit: number): GetDacsInput {
    return new GetDacsInput(dacId, limit);
  }
  
  private constructor(
    public readonly dacId: string,
    public readonly limit: number = 10
  ) {}

  public toJSON(): UnknownObject {
    const { dacId, limit } = this;
    return { dacId, limit };
  }
}
