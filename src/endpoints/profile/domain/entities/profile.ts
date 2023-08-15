import { Entity, UnknownObject } from '@alien-worlds/aw-core';

import { ProfileError } from '../../data/dtos/profile.dto';
import { ProfileItem } from './profile-item';

/**
 * Represents Profile data entity.
 * @class
 */
export class Profile implements Entity {
  id?: string;
  rest?: UnknownObject;

  /**
   * @private
   * @constructor
   */
  private constructor(
    public account: string,
    public dac: string,
    public actionName: string,
    public blockNum: string,
    public profile: ProfileItem,
    public error?: ProfileError
  ) { }

  public static create(
    account: string,
    dac: string,
    actionName: string,
    blockNum: string,
    profile: ProfileItem,
    error: ProfileError,
    id?: string,
    rest?: UnknownObject
  ): Profile {
    const entity = new Profile(
      account,
      dac,
      actionName,
      blockNum,
      profile,
      error
    );

    entity.id = id;
    entity.rest = rest;

    return entity;
  }

  public static createErrorProfile(
    account: string,
    error: ProfileError
  ): Profile {
    return new Profile(account, null, null, null, null, error);
  }

  toJSON(): UnknownObject {
    throw new Error('Method not implemented.');
  }
}
