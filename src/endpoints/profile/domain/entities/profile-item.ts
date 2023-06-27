import { Entity, UnknownObject } from '@alien-worlds/api-core';

/**
 * Represents ProfileItem data entity.
 * @class
 */
export class ProfileItem implements Entity {
  /**
   * @private
   * @constructor
   */
  private constructor(
    public readonly description: string,
    public readonly email: string,
    public readonly familyName: string,
    public readonly gender: string,
    public readonly givenName: string,
    public readonly image: string,
    public readonly timezone: string,
    public readonly url: string
  ) {}

  id?: string;
  rest?: UnknownObject;

  toJSON(): UnknownObject {
    const {
      description,
      email,
      familyName,
      gender,
      givenName,
      image,
      timezone,
      url,
    } = this;

    return {
      description,
      email,
      familyName,
      gender,
      givenName,
      image,
      timezone,
      url,
    };
  }

  public static create(
    description: string,
    email: string,
    familyName: string,
    gender: string,
    givenName: string,
    image: string,
    timezone: string,
    url: string,
    id?: string,
    rest?: UnknownObject
  ): ProfileItem {
    const entity = new ProfileItem(
      description,
      email,
      familyName,
      gender,
      givenName,
      image,
      timezone,
      url
    );

    entity.rest = rest;

    return entity;
  }
}
