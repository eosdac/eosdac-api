/* eslint-disable @typescript-eslint/no-explicit-any */
import * as DaoWorldsCommon from '@alien-worlds/aw-contract-dao-worlds';
import * as TokenWorldsCommon from '@alien-worlds/aw-contract-token-worlds';

import { CandidateProfile } from '../../entities/candidate-profile';
import { ContractAction } from '@alien-worlds/aw-core';
import { GetCandidatesOutput } from '../get-candidates.output';
import { Profile } from '../../../../profile/domain/entities/profile';
import { ProfileMongoMapper } from '@endpoints/profile/data/mappers/profile.mapper';

const profiles: Profile[] = [
  ProfileMongoMapper.toEntity(
    new ContractAction<DaoWorldsCommon.Actions.Entities.Stprofile>(
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
    )
  ),
];

describe('GetCandidatesOutput', () => {
  let dacId: string;
  let candidates: DaoWorldsCommon.Deltas.Entities.Candidates[];
  let agreedTerms: Map<string, number>;
  let votedCandidates: string[];
  let candidateProfiles: CandidateProfile[];

  beforeEach(() => {
    dacId = 'eyeke';

    candidates = [
      new DaoWorldsCommon.Deltas.Mappers.CandidatesRawMapper().toEntity({
        is_active: 1,
        candidate_name: 'candidate1',
        requestedpay: 'test',
        total_votes: 1,
        avg_vote_time_stamp: new Date(),
        rank: 1,
        gap_filler: 1,
        total_vote_power: 1,
      }),
    ];

    agreedTerms = new Map<string, number>();
    agreedTerms.set('candidate1', 1);

    votedCandidates = ['candidate1'];
    candidateProfiles = [
      CandidateProfile.create(
        dacId,
        candidates[0],
        profiles[0],
        new TokenWorldsCommon.Deltas.Mappers.MembertermsRawMapper().toEntity({
          version: 1,
        }),
        1,
        votedCandidates
      ),
    ];
  });

  it('should create a GetCandidatesOutput object with the correct properties', () => {
    const result = GetCandidatesOutput.create(candidateProfiles);

    expect(result).toBeInstanceOf(GetCandidatesOutput);
    expect(result.results).toBeDefined();
  });

  it('should create a CandidateProfile for each candidate in the input array', () => {
    const result = GetCandidatesOutput.create(candidateProfiles);

    expect(result.results).toHaveLength(1);
  });

  it('should return JSON result object', () => {
    const result = GetCandidatesOutput.create(candidateProfiles);
    const json = result.toJSON();

    expect(json).toBeDefined();
  });
});
