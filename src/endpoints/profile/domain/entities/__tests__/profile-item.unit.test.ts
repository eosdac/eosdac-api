import { ProfileItem } from '../profile-item';
import { ProfileItemDocument } from '../../../data/dtos/profile.dto';
/*imports*/
/*mocks*/
const profileItemDto: ProfileItemDocument = {
  description: 'string',
  email: 'string',
  familyName: 'string',
  gender: 'string',
  givenName: 'string',
  image: 'string',
  timezone: 'string',
  url: 'string',
};

describe('ProfileItem unit tests', () => {
  it('ProfileItem.fromDto should return ProfileItem object based on the provided dto', async () => {
    const profileItem = ProfileItem.fromDto(profileItemDto);

    expect(profileItem).toBeInstanceOf(ProfileItem);
    expect(profileItem).toEqual(profileItemDto);
  });

  it('"toDto" should return a dto based on entity', async () => {
    const profileItem = ProfileItem.fromDto(profileItemDto);

    expect(profileItem.toDto()).toEqual(profileItemDto);
  });

  /*unit-tests*/
});

