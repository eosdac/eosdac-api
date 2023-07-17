import * as AlienWorldsCommon from '@alien-worlds/alien-worlds-common';
import * as DaoWorldsCommon from '@alien-worlds/dao-worlds-common';
import * as IndexWorldsCommon from '@alien-worlds/index-worlds-common';
import * as TokenWorldsCommon from '@alien-worlds/token-worlds-common';

import { DacMapper } from '@endpoints/get-dacs/data/mappers/dacs.mapper';
import { GetDacOutput } from '../get-dac.output';
import { Pair } from '@alien-worlds/eosio-contract-types';

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
    const output = GetDacOutput.create(
      dacDir,
      dacTreasury,
      dacGlobals,
      dacStats
    );

    expect(output).toBeInstanceOf(GetDacOutput);
  });

  it('GetDacOutput.toJson should return json object', async () => {
    const output = GetDacOutput.create(
      dacDir,
      dacTreasury,
      dacGlobals,
      dacStats
    );

    expect(output.toJson()).toBeInstanceOf(Object);
  });
});
