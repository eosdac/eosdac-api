import * as AlienWorldsCommon from '@alien-worlds/aw-contract-alien-worlds';
import * as DaoWorldsCommon from '@alien-worlds/aw-contract-dao-worlds';
import * as IndexWorldsCommon from '@alien-worlds/aw-contract-index-worlds';
import * as TokenWorldsCommon from '@alien-worlds/aw-contract-token-worlds';

import { DacAggregateRecord } from '../dac-aggregate-record';
import { DacMapper } from '@endpoints/dacs/data/mappers/dacs.mapper';
import { Pair } from '@alien-worlds/aw-antelope';

const dacDir = new DacMapper().toDac(
  new IndexWorldsCommon.Deltas.Mappers.DacsRawMapper().toEntity({
    accounts: [{ key: '2', value: 'dao.worlds' }] as Pair[],
    symbol: { sym: 'EYE', contract: '' },
    refs: [],
  })
);

const dacTreasury =
  new AlienWorldsCommon.Deltas.Mappers.AccountsRawMapper().toEntity({
    balance: 'string',
  });

const dacGlobals =
  new DaoWorldsCommon.Deltas.Mappers.DacglobalsRawMapper().toEntity({
    data: [
      {
        key: 'auth_threshold_high',
        value: ['uint8', 3],
      },
      {
        key: 'lastclaimbudgettime',
        value: ['time_point_sec', '2023-08-10T10:23:43'],
      },
      {
        key: 'lastperiodtime',
        value: ['time_point_sec', '2023-08-09T03:00:15'],
      },
      {
        key: 'lockupasset',
        value: [
          'extended_asset',
          { quantity: '5000.0000 EYE', contract: 'token.worlds' }
        ],
      },
      {
        key: 'maxvotes',
        value: ['uint8', 2],
      },
      {
        key: 'numelected',
        value: ['uint8', 5],
      },
      {
        key: 'periodlength',
        value: ['uint32', 604800],
      }
    ] as Pair<string, any>[],
  });

const dacStats = new TokenWorldsCommon.Deltas.Mappers.StatRawMapper().toEntity({
  supply: 'string',
  max_supply: 'string',
  issuer: 'string',
  transfer_locked: false,
});

describe('DacAggregateRecord Unit tests', () => {
  it('"DacAggregateRecord.create" should create instance', async () => {
    const output = DacAggregateRecord.create(
      dacDir,
      dacTreasury,
      dacGlobals,
      dacStats
    );

    expect(output).toBeInstanceOf(DacAggregateRecord);
  });

  it('DacAggregateRecord.toJSON should return json object', async () => {
    const output = DacAggregateRecord.create(
      dacDir,
      dacTreasury,
      dacGlobals,
      dacStats
    );

    expect(output.toJSON()).toBeInstanceOf(Object);
  });
});
