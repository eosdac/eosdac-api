import { removeUndefinedProperties } from '@alien-worlds/api-core';
import { ProfileItemDocument } from '../../data/dtos/profile.dto';
/*imports*/
/**
 * Represents ProfileItem data entity.
 * @class
 */
export class ProfileItem {
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
    public readonly url: string,
  ) { }

  /**
   * Create DTO based on entity data
   *
   * @returns {ProfileItemDocument}
   */
  public toDto(): ProfileItemDocument {
    const dto = {
      description: this.description,
      email: this.email,
      familyName: this.familyName,
      gender: this.gender,
      givenName: this.givenName,
      image: this.image,
      timezone: this.timezone,
      url: this.url,
    };

    // Remove undefined properties so as not to send them to the data source.
    // This should not happen - the only exception is the "_id" property
    // which may be undefined if the entity was created on the basis of
    // DTO without given id, e.g. from the message.

    return removeUndefinedProperties<ProfileItemDocument>(dto);
  }

  /**
   * Creates instances of ProfileItem based on a given DTO.
   *
   * @static
   * @public
   * @param {ProfileItemDocument} dto
   * @returns {ProfileItem}
   */
  public static fromDto(dto: ProfileItemDocument): ProfileItem {
    const {
      description,
      email,
      familyName,
      gender,
      givenName,
      image,
      timezone,
      url,
    } = dto;

    return new ProfileItem(
      description,
      email,
      familyName,
      gender,
      givenName,
      image,
      timezone,
      url,
    );
  }
}

