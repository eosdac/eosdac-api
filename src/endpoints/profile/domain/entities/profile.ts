import { ActionDataProfile, ProfileError } from '../../data/dtos/profile.dto';

import { ActionDocument } from '@alien-worlds/eosdac-api-common';
import { Long } from '@alien-worlds/api-core';
import { ProfileItem } from './profile-item';
import { removeUndefinedProperties } from '@common/utils/dto.utils';

/*imports*/
/**
 * Represents Profile data entity.
 * @class
 */
export class Profile {
  /**
   * @private
   * @constructor
   */
  private constructor(
    public readonly account: string,
    public readonly dac: string,
    public readonly actionName: string,
    public readonly blockNum: string,
    public readonly profile: ProfileItem,
    public readonly error?: ProfileError,
  ) { }

  /**
   * Create DTO based on entity data
   *
   * @returns {ActionDocument}
   */
  public toDto(): ActionDocument {
    const dto: ActionDocument = {
      block_num: Long.fromString(this.blockNum),
      action: {
        authorization: null,
        account: this.dac,
        name: this.actionName,
        data: {
          cand: this.account,
          profile: this.profile.toDto(),
        }
      },
    };

    // Remove undefined properties so as not to send them to the data source.
    // This should not happen - the only exception is the "_id" property
    // which may be undefined if the entity was created on the basis of
    // DTO without given id, e.g. from the message.

    return removeUndefinedProperties<ActionDocument>(dto);
  }

  /**
   * Creates instances of Profile based on a given DTO.
   *
   * @static
   * @public
   * @param {ActionDocument} dto
   * @returns {Profile}
   */
  public static fromDto(dto: ActionDocument): Profile {
    const { block_num, action, account } = dto;


    const actionData = action.data as ActionDataProfile

    let profileJson;
    if (typeof actionData.profile === 'string') {
      profileJson = JSON.parse(actionData.profile);
    }

    return new Profile(actionData.cand, action.account, action.name, block_num.toString(), ProfileItem.fromDto(profileJson))
  }

  public static createErrorProfile(account: string, error: ProfileError): Profile {
    return new Profile(account, null, null, null, null, error)
  }
}

