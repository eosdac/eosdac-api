import { Entity, UnknownObject } from '@alien-worlds/api-core';

/**
 * Represents State data entity.
 * @class
 */
export class BlockState implements Entity {
  /**
   * @private
   * @constructor
   */
  private constructor(public readonly blockNumber: bigint) {}
  id?: string;
  rest?: UnknownObject;

  public static create(
    blockNumber: bigint,
    id?: string,
    rest?: UnknownObject
  ): BlockState {
    const entity = new BlockState(blockNumber);

    entity.id = id;
    entity.rest = rest;

    return entity;
  }

  toJSON(): UnknownObject {
    throw new Error('Method not implemented.');
  }
}
