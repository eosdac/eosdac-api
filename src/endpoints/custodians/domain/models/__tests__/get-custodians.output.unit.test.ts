/* eslint-disable @typescript-eslint/no-explicit-any */
import { CustodianProfile } from '../../entities/custodian-profile';
import { DaoWorldsContract } from '@alien-worlds/dao-api-common';
import { GetCustodiansOutput } from '../get-custodians.output';
import { Profile } from '../../../../profile/domain/entities/profile';

describe('GetCustodiansOutput', () => {
  let dacId: string;
  const custodians = [
    DaoWorldsContract.Deltas.Entities.Custodian.fromStruct({
      cust_name: 'custodian1',
      requestedpay: 'test',
      total_vote_power: 1,
      rank: 1,
    }),
    DaoWorldsContract.Deltas.Entities.Custodian.fromStruct({
      cust_name: 'custodian2',
      requestedpay: 'test',
      total_vote_power: 1,
      rank: 1,
    }),
  ] as any;
  const profiles = [
    Profile.fromDto({
      block_num: 1,
      action: {
        account: 'custodian1',
        name: '',
        data: { cand: '', profile: '{}' },
      },
    } as any),
    Profile.fromDto({
      block_num: 1,
      action: {
        account: 'custodian2',
        name: '',
        data: { cand: '', profile: '{}' },
      },
    } as any),
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
    expect(result.results[0].requestedPayment).toBeDefined();
    expect(result.results[0].votePower).toBeDefined();
    expect(result.results[0].profile).toBeDefined();
    expect(result.results[0].agreedTermVersion).toBeDefined();
    expect(result.results[0].currentPlanetMemberTermsSignedValid).toBeDefined();
    expect(result.results[0].isFlagged).toBeDefined();
    expect(result.results[0].isSelected).toBeDefined();
    expect(result.results[0].planetName).toBeDefined();
  });
});
