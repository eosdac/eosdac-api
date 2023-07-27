import * as DaoWorldsCommon from '@alien-worlds/aw-contract-dao-worlds';
import * as TokenWorldsCommon from '@alien-worlds/aw-contract-token-worlds';

import { Asset } from '@alien-worlds/aw-antelope';
import { ContractAction } from '@alien-worlds/aw-core';
import { CustodianProfile } from '../custodian-profile';
import { Profile } from '@endpoints/profile/domain/entities/profile';
import { ProfileMongoMapper } from '@endpoints/profile/data/mappers/profile.mapper';

describe('CustodianProfile', () => {
  const dacId = 'eyeke';
  const custodian = DaoWorldsCommon.Deltas.Entities.Custodians1.create(
    'John Doe',
    Asset.create(500, 'TLM'),
    10000,
    0,
    0,
    new Date()
  );

  const profile: Profile = ProfileMongoMapper.toEntity(
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
  );

  const memberTerms = TokenWorldsCommon.Deltas.Entities.Memberterms.create(
    'string',
    'string',
    1
  );
  const agreedTermsVersion = 1;

  it('should create an instance of CustodianProfile with correct values', () => {
    const result = CustodianProfile.create(
      dacId,
      custodian,
      profile,
      memberTerms,
      agreedTermsVersion
    );

    expect(result.walletId).toEqual(custodian.custName);
    expect(result.requestedpay).toEqual(custodian.requestedpay);
    expect(result.votePower).toEqual(custodian.totalVotePower / 10000);
    expect(result.profile).toEqual(profile.profile);
    expect(result.agreedTermVersion).toEqual(agreedTermsVersion);
    expect(result.currentPlanetMemberTermsSignedValid).toEqual(
      memberTerms.version === agreedTermsVersion
    );
    expect(result.isFlagged).toEqual(false);
    expect(result.isSelected).toEqual(false);
    expect(result.planetName).toEqual(dacId);
  });

  it('should return a JSON representation of the CustodianProfile instance', () => {
    const instance = CustodianProfile.create(
      dacId,
      custodian,
      profile,
      memberTerms,
      agreedTermsVersion
    );
    const result = instance.toJSON();

    expect(result.walletId).toEqual(instance.walletId);
    expect(result.requestedpay).toEqual(
      `${instance.requestedpay.value} ${instance.requestedpay.symbol}`
    );
    expect(result.votePower).toEqual(Number(instance.votePower.toFixed(0)));
    expect(result).toMatchObject(profile.profile);
    expect(result.agreedTermVersion).toEqual(instance.agreedTermVersion);
    expect(result.currentPlanetMemberTermsSignedValid).toEqual(
      instance.currentPlanetMemberTermsSignedValid
    );
    expect(result.isFlagged).toEqual(instance.isFlagged);
    expect(result.isSelected).toEqual(instance.isSelected);
    expect(result.planetName).toEqual(instance.planetName);
  });
});
