import * as DaoWorldsCommon from '@alien-worlds/aw-contract-dao-worlds';

import { ProfileItemMapper, ProfileMongoMapper } from '../profile.mapper';

import { ContractAction } from '@alien-worlds/aw-core';
import { Profile } from '@endpoints/profile/domain/entities/profile';
import { ProfileItem } from '@endpoints/profile/domain/entities/profile-item';

const contractAction: ContractAction<
  DaoWorldsCommon.Actions.Entities.Stprofile,
  DaoWorldsCommon.Actions.Types.StprofileMongoModel
> = new ContractAction<DaoWorldsCommon.Actions.Entities.Stprofile>(
  'mgaqy.wam',
  new Date('2021-02-25T04:18:56.000Z'),
  209788070n,
  'dao.worlds',
  'stprofile',
  65909692153n,
  1980617n,
  '591B113058F8AD3FBFF99C7F2BA92A921919F634A73CBA4D8059FAE8D2F5666C',
  DaoWorldsCommon.Actions.Entities.Stprofile.create(
    'awtesteroo12',
    '{"description":"Test Description","email":"test@example.com","familyName":"Doe","givenName":"John","gender":"Male","image":"profile.jpg","timezone":"GMT","url":"https://example.com"}',
    'testa'
  )
);

const profileItemDto = {
  description: 'Test Description',
  email: 'test@example.com',
  familyName: 'Doe',
  givenName: 'John',
  gender: 'Male',
  image: 'profile.jpg',
  timezone: 'GMT',
  url: 'https://example.com',
};

describe('ProfileMapper', () => {
  describe('toEntity', () => {
    it('should return an instance of Profile', () => {
      const result = ProfileMongoMapper.toEntity(contractAction);

      expect(result).toBeInstanceOf(Profile);
      expect(result.account).toEqual(contractAction.data.cand);

      const expectedProfileItem = ProfileItemMapper.toEntity(profileItemDto);
      expect(result.profile).toEqual(expectedProfileItem);
    });
  });

  describe('ProfileItemMapper', () => {
    describe('toEntity', () => {
      it('should return an instance of ProfileItem', () => {
        const result = ProfileItemMapper.toEntity(profileItemDto);

        expect(result).toBeInstanceOf(ProfileItem);
        expect(result.description).toEqual(profileItemDto.description);
        expect(result.email).toEqual(profileItemDto.email);
        expect(result.familyName).toEqual(profileItemDto.familyName);
        expect(result.gender).toEqual(profileItemDto.gender);
        expect(result.givenName).toEqual(profileItemDto.givenName);
        expect(result.image).toEqual(profileItemDto.image);
        expect(result.timezone).toEqual(profileItemDto.timezone);
        expect(result.url).toEqual(profileItemDto.url);
      });
    });
  });
});
