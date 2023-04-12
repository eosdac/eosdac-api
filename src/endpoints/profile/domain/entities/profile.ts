import {
  ContractActionDocument,
  MongoDB,
  removeUndefinedProperties,
} from '@alien-worlds/api-core';

import { DaoWorldsContract } from '@alien-worlds/dao-api-common';
import { ProfileError } from '../../data/dtos/profile.dto';
import { ProfileItem } from './profile-item';

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
    public readonly error?: ProfileError
  ) {}

  /**
   * Create DTO based on entity data
   *
   * @returns {ContractActionDocument}
   */
  public toDto(): ContractActionDocument {
    const dto: ContractActionDocument = {
      block_num: MongoDB.Long.fromString(this.blockNum),
      action: {
        authorization: null,
        account: this.dac,
        name: this.actionName,
        data: {
          cand: this.account,
          profile: this.profile.toDto(),
        },
      },
    };

    // Remove undefined properties so as not to send them to the data source.
    // This should not happen - the only exception is the "_id" property
    // which may be undefined if the entity was created on the basis of
    // DTO without given id, e.g. from the message.

    return removeUndefinedProperties<ContractActionDocument>(dto);
  }

  /**
   * Creates instances of Profile based on a given DTO.
   *
   * @static
   * @public
   * @param {ContractActionDocument} dto
   * @returns {Profile}
   */
  public static fromDto(
    dto: ContractActionDocument<DaoWorldsContract.Actions.Types.StprofileDocument>
  ): Profile {
    const { block_num, action } = dto;
    const { profile, cand } = action.data;

    let profileJson;
    if (typeof profile === 'string') {
      profileJson = JSON.parse(profile);
    }

    return new Profile(
      cand,
      action.account,
      action.name,
      block_num.toString(),
      ProfileItem.fromDto(profileJson)
    );
  }

  public static createErrorProfile(
    account: string,
    error: ProfileError
  ): Profile {
    return new Profile(account, null, null, null, null, error);
  }
}
