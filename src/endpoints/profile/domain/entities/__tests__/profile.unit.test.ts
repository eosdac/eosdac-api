import * as DaoWorldsCommon from '@alien-worlds/aw-contract-dao-worlds';

import { MongoDB } from '@alien-worlds/aw-storage-mongodb';
import { Profile } from '../profile';
import { ProfileError } from '../../../data/dtos/profile.dto';
import { ProfileItem } from '../profile-item';

const data = {
  account: 'awtesteroo12',
  dac: 'eyeke',
  actionName: DaoWorldsCommon.Actions.DaoWorldsActionName.Stprofile,
  blockNum: '12345',
  profileItem: ProfileItem.create('description', 'email', 'familyName', 'gender', 'givenName', 'image', 'timezone', 'url'),
  profileError: {
    name: 'awtesteroo12',
    body: 'blocked account',
  } as ProfileError,
  id: new MongoDB.ObjectId(),
}


describe('Profile', () => {
  it('should create a profile with all properties', () => {
    const profile = Profile.create(
      data.account,
      data.dac,
      data.actionName,
      data.blockNum,
      data.profileItem,
      data.profileError,
      data.id.toString(),
      {},
    );

    expect(profile.account).toBe(data.account);
    expect(profile.dac).toBe(data.dac);
    expect(profile.actionName).toBe(data.actionName);
    expect(profile.blockNum).toBe(data.blockNum);
    expect(profile.profile).toBe(data.profileItem);
    expect(profile.error).toBe(data.profileError);
    expect(profile.id).toBe(data.id.toString());
    expect(profile.rest).toEqual({});
  });

  it('should create an error profile', () => {
    const errorProfile = Profile.createErrorProfile(data.account, data.profileError);

    expect(errorProfile.account).toBe(data.account);
    expect(errorProfile.dac).toBeNull();
    expect(errorProfile.actionName).toBeNull();
    expect(errorProfile.blockNum).toBeNull();
    expect(errorProfile.profile).toBeNull();
    expect(errorProfile.error).toBe(data.profileError);
    expect(errorProfile.id).toBeUndefined();
    expect(errorProfile.rest).toBeUndefined();
  });

  it('should throw an error when toJSON is called', () => {
    const profile = Profile.create(
      data.account,
      data.dac,
      data.actionName,
      data.blockNum,
      data.profileItem,
      data.profileError,
      data.id.toString(),
      {},
    );

    expect(() => profile.toJSON()).toThrowError('Method not implemented.');
  });
});
