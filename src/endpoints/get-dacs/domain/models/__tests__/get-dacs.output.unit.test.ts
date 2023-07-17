import * as AlienWorldsCommon from '@alien-worlds/alien-worlds-common';
import * as DaoWorldsCommon from '@alien-worlds/dao-worlds-common';
import * as IndexWorldsCommon from '@alien-worlds/index-worlds-common';
import * as TokenWorldsCommon from '@alien-worlds/token-worlds-common';

import { DacMapper } from '@endpoints/get-dacs/data/mappers/dacs.mapper';
import { GetDacOutput } from '../get-dac.output';
import { GetDacsOutput } from '../get-dacs.output';

const dacDir = new DacMapper().toDac(
  new IndexWorldsCommon.Deltas.Mappers.DacsRawMapper().toEntity({
    accounts: [],
    symbol: { symbol: 'EYE', contract: '' },
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

describe('GetDacsOutput Unit tests', () => {
  it('"GetDacsOutput.create" should create instance', async () => {
    const output = GetDacsOutput.create([
      GetDacOutput.create(dacDir, dacTreasury, dacGlobals, dacStats),
    ]);

    expect(output).toBeInstanceOf(GetDacsOutput);
  });

  it('GetDacsOutput.toJson should return json object', async () => {
    const output = GetDacsOutput.create([
      GetDacOutput.create(dacDir, dacTreasury, dacGlobals, dacStats),
    ]);

    expect(output.toJson()).toBeInstanceOf(Object);
  });
});
