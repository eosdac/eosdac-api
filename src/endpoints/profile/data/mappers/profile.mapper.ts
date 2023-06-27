import * as DaoWorldsCommon from '@alien-worlds/dao-worlds-common';

import { ContractAction } from '@alien-worlds/api-core';
import { Profile } from '@endpoints/profile/domain/entities/profile';
import { ProfileItem } from '@endpoints/profile/domain/entities/profile-item';
import { ProfileItemDocument } from '../dtos/profile.dto';

export class ProfileMongoMapper {
  /**
   * Creates instances of Profile based on a given DTO.
   *
   * @static
   * @public
   * @param {ContractActionDocument} dto
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

    let profileJson;
    if (typeof profile === 'string') {
      profileJson = JSON.parse(profile);
    }

    return Profile.create(
      cand,
      account,
      name,
      blockNumber.toString(),
      ProfileItemMapper.toEntity(profileJson),
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
