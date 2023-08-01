import * as DaoWorldsCommon from '@alien-worlds/aw-contract-dao-worlds';
import * as TokenWorldsCommon from '@alien-worlds/aw-contract-token-worlds';

import { Asset } from '@alien-worlds/aw-antelope';
import { CandidateProfile } from '../candidate-profile';
import { ContractAction } from '@alien-worlds/aw-core';
import { Profile } from '@endpoints/profile/domain/entities/profile';
import { ActionToProfileMapper } from '@endpoints/profile/data/mappers/action-to-profile.mapper';

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
    '{"givenName":"awtesteroo12 name","familyName":"awtesteroo12Family Name","image":"https://support.hubstaff.com/wp-content/uploads/2019/08/good-pic.png","description":"Here\'s a description of this amazing candidate with the name: awtesteroo12.\\n And here\'s another line about something."}',
    'testa'
  )
);

const profile: Profile = ActionToProfileMapper.toEntity(contractAction);

describe('CandidateProfile', () => {
  let candidateProfile: CandidateProfile;

  beforeEach(() => {
    const cand = DaoWorldsCommon.Deltas.Entities.Candidates.create(
      'walletId',
      Asset.create(100, 'TLM'),
      1,
      0,
      1,
      1,
      10,
      new Date(),
      0
    );

    candidateProfile = CandidateProfile.create(
      'testa',
      cand,
      profile,
      TokenWorldsCommon.Deltas.Entities.Memberterms.getDefault(),
      0
    );
  });

  afterEach(() => {
    candidateProfile = null;
  });

  it('should create an instance of CandidateProfile', () => {
    expect(candidateProfile).toBeInstanceOf(CandidateProfile);
  });

  it('should have correct properties', () => {
    expect(candidateProfile.account).toBe('walletId');
    expect(candidateProfile.requestedPay).toEqual({
      value: 100,
      symbol: 'TLM',
    });
    expect(candidateProfile.rank).toBe(1);
    expect(candidateProfile.isActive).toBe(true);
    expect(candidateProfile.totalVotes).toBe(10);
    expect(candidateProfile.profile).toBeDefined();
    expect(candidateProfile.signedDaoTermsVersion).toBe(0);
    expect(candidateProfile.isFlagged).toBe(false);
    expect(candidateProfile.dacId).toBe('testa');
  });

  it('should correctly calculate toJSON method', () => {
    const json = candidateProfile.toJSON();

    expect(json).toEqual({
      description:
        "Here's a description of this amazing candidate with the name: awtesteroo12.\n" +
        " And here's another line about something.",
      email: undefined,
      familyName: 'awtesteroo12Family Name',
      gender: undefined,
      givenName: 'awtesteroo12 name',
      image:
        'https://support.hubstaff.com/wp-content/uploads/2019/08/good-pic.png',
      timezone: undefined,
      url: undefined,
      account: 'walletId',
      requestedpay: '100 TLM',
      votePower: 0,
      rank: 1,
      isActive: true,
      totalVotes: 10,
      voteDecay: 0,
      signedDaoTermsVersion: 0,
      hasSignedCurrentDaoTerms: true,
      isFlagged: false,
      dacId: 'testa',
    });
  });
});
