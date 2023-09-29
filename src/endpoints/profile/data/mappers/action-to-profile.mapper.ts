import * as DaoWorldsCommon from '@alien-worlds/aw-contract-dao-worlds';

import { ContractAction, log } from '@alien-worlds/aw-core';

import { Profile } from '@endpoints/profile/domain/entities/profile';
import { ProfileItem } from '@endpoints/profile/domain/entities/profile-item';
import { ProfileItemDocument } from '../dtos/profile.dto';

export class ActionToProfileMapper {
  /**
   * Creates instances of Profile based on a given Stprofile action.
   *
   * @static
   * @public
   * @returns {Profile}
   */
  public static toEntity(
    action: ContractAction<
      DaoWorldsCommon.Actions.Entities.Stprofile,
      DaoWorldsCommon.Actions.Types.StprofileMongoModel
    >
  ): Profile {
    const { blockNumber, data, account, name } = action;

    const { profile, cand } = data;

    let profileJson = null;
    if (typeof profile === 'string') {
      try {
        profileJson = JSON.parse(profile);
      }
      catch (error) {
        log(`Error trying to parse profile for candidate "${data.cand}"`);
      }
    }

    return Profile.create(
      cand,
      account,
      name,
      blockNumber.toString(),
      profileJson ? ProfileItemMapper.toEntity(profileJson) : null,
      null,
      null,
      null
    );
  }
}

export class ProfileItemMapper {
  /**
   * Creates instances of ProfileItem based on a given DTO.
   *
   * @static
   * @public
   * @param {ProfileItemDocument} dto
   * @returns {ProfileItem}
   */
  public static toEntity(dto: ProfileItemDocument): ProfileItem {
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

    return ProfileItem.create(
      description,
      email,
      familyName,
      gender,
      givenName,
      image,
      timezone,
      url
    );
  }
}
