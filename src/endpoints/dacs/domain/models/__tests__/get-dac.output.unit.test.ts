import * as AlienWorldsCommon from '@alien-worlds/aw-contract-alien-worlds';
import * as DaoWorldsCommon from '@alien-worlds/aw-contract-dao-worlds';
import * as IndexWorldsCommon from '@alien-worlds/aw-contract-index-worlds';
import * as TokenWorldsCommon from '@alien-worlds/aw-contract-token-worlds';

import { DacMapper } from '@endpoints/dacs/data/mappers/dacs.mapper';
import { DacAggregateRecord } from '../dac-aggregate-record';
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
    data: [],
  });

const dacStats = new TokenWorldsCommon.Deltas.Mappers.StatRawMapper().toEntity({
  supply: 'string',
  max_supply: 'string',
  issuer: 'string',
  transfer_locked: false,
});

describe('GetDacOutput Unit tests', () => {
  it('"GetDacOutput.create" should create instance', async () => {
    const output = DacAggregateRecord.create(
      dacDir,
      dacTreasury,
      dacGlobals,
      dacStats
    );

    expect(output).toBeInstanceOf(DacAggregateRecord);
  });

  it('GetDacOutput.toJson should return json object', async () => {
    const output = DacAggregateRecord.create(
      dacDir,
      dacTreasury,
      dacGlobals,
      dacStats
    );

    expect(output.toJSON()).toBeInstanceOf(Object);
  });
});
