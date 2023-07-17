import * as DaoWorldsCommon from '@alien-worlds/dao-worlds-common';
import * as TokenWorldsCommon from '@alien-worlds/token-worlds-common';

import { Asset } from '@alien-worlds/eosio-contract-types';
import { CandidateProfile } from '../candidate-profile';
import { ContractAction } from '@alien-worlds/api-core';
import { Profile } from '@endpoints/profile/domain/entities/profile';
import { ProfileMongoMapper } from '@endpoints/profile/data/mappers/profile.mapper';

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

const profile: Profile = ProfileMongoMapper.toEntity(contractAction);

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
      0,
      []
    );
  });

  afterEach(() => {
    candidateProfile = null;
  });

  it('should create an instance of CandidateProfile', () => {
    expect(candidateProfile).toBeInstanceOf(CandidateProfile);
  });

  it('should have correct properties', () => {
    expect(candidateProfile.walletId).toBe('walletId');
    expect(candidateProfile.requestedPay).toEqual({
      value: 100,
      symbol: 'TLM',
    });
    expect(candidateProfile.rank).toBe(1);
    expect(candidateProfile.gapFiller).toBe(0);
    expect(candidateProfile.isActive).toBe(true);
    expect(candidateProfile.totalVotes).toBe(10);
    expect(candidateProfile.profile).toBeDefined();
    expect(candidateProfile.agreedTermVersion).toBe(0);
    expect(candidateProfile.currentPlanetMemberTermsSignedValid).toBe(true);
    expect(candidateProfile.isFlagged).toBe(false);
    expect(candidateProfile.isSelected).toBe(false);
    expect(candidateProfile.isVoted).toBe(false);
    expect(candidateProfile.isVoteAdded).toBe(false);
    expect(candidateProfile.planetName).toBe('testa');
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
      id: undefined,
      rest: undefined,
      walletId: 'walletId',
      requestedpay: '100 TLM',
      votePower: 0,
      rank: 1,
      gapFiller: 0,
      isActive: 1,
      totalVotes: 10,
      voteDecay: 0,
      agreedTermVersion: 0,
      currentPlanetMemberTermsSignedValid: true,
      isFlagged: false,
      isSelected: false,
      isVoted: false,
      isVoteAdded: false,
      planetName: 'testa',
    });
  });
});
