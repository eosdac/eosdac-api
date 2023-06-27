import { MongoDB } from '@alien-worlds/storage-mongodb';
import { Profile } from '../../entities/profile';
import { ProfileOutput } from '../profile.output';

const workerProposals: Profile[] = [
  // Profile.fromDto({
  //   action: {
  //     data: {
  //       cand: 'string',
  //       profile: `{"givenName":"awtesteroo12 name",
  // 						"familyName":"awtesteroo12Family Name",
  // 						"image":"image-url","description":"string"}`,
  //     },
  //   } as any,
  //   block_num: MongoDB.Long.ZERO,
  // }),
];

describe('ProfileOutput Unit tests', () => {
  it('"ProfileOutput.create" should create instance', async () => {
    const output = ProfileOutput.create(workerProposals);

    expect(output).toBeInstanceOf(ProfileOutput);
  });

  it('ProfileOutput.toJson should return json object', async () => {
    const output = ProfileOutput.create(workerProposals);

    expect(output.toJSON()).toBeInstanceOf(Object);
  });
});
