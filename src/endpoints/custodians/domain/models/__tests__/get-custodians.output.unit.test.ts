import * as DaoWorldsCommon from '@alien-worlds/dao-worlds-common';

import { ContractAction } from '@alien-worlds/api-core';
import { CustodianProfile } from '../../entities/custodian-profile';
import { GetCustodiansOutput } from '../get-custodians.output';
import { Profile } from '../../../../profile/domain/entities/profile';
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

const profiles: Profile[] = [ProfileMongoMapper.toEntity(contractAction)];

describe('GetCustodiansOutput', () => {
  let dacId: string;
  const custodians1RawMapper =
    new DaoWorldsCommon.Deltas.Mappers.Custodians1RawMapper();

  const custodians = [
    custodians1RawMapper.toEntity({
      cust_name: 'custodian1',
      requestedpay: 'test',
      total_vote_power: 1,
      rank: 1,
    }),
    custodians1RawMapper.toEntity({
      cust_name: 'custodian2',
      requestedpay: 'test',
      total_vote_power: 1,
      rank: 1,
    }),
  ] as any;

  const terms = { version: 1n, text: 'terms' } as any;
  let custodianProfiles: CustodianProfile[];

  beforeEach(() => {
    dacId = 'dacId';
    custodianProfiles = [
      CustodianProfile.create(dacId, custodians[0], profiles[0], terms, 1),
      CustodianProfile.create(dacId, custodians[1], profiles[1], terms, 1),
    ] as any;
  });

  it('should create a GetCustodiansOutput object with the correct properties', () => {
    const result = GetCustodiansOutput.create(custodianProfiles);

    expect(result).toBeInstanceOf(GetCustodiansOutput);
    expect(result.results).toBeDefined();
  });

  it('should create a CandidateProfile for each custodian in the input array', () => {
    const result = GetCustodiansOutput.create(custodianProfiles);

    expect(result.results).toHaveLength(2);

    expect(result.results[0]).toBeInstanceOf(CustodianProfile);
    expect(result.results[0].walletId).toBeDefined();
    expect(result.results[0].requestedpay).toBeDefined();
    expect(result.results[0].votePower).toBeDefined();
    expect(result.results[0].profile).toBeDefined();
    expect(result.results[0].agreedTermVersion).toBeDefined();
    expect(result.results[0].currentPlanetMemberTermsSignedValid).toBeDefined();
    expect(result.results[0].isFlagged).toBeDefined();
    expect(result.results[0].isSelected).toBeDefined();
    expect(result.results[0].planetName).toBeDefined();
  });

  it('should return JSON object', () => {
    const result = GetCustodiansOutput.create(custodianProfiles);
    const json = result.toJSON();

    expect(json).toBeInstanceOf(Array);
  });
});
