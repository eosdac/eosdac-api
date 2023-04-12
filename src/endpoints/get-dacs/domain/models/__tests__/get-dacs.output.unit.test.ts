import {
  AlienWorldsContract,
  DacDirectory,
  DaoWorldsContract,
  TokenWorldsContract,
} from '@alien-worlds/dao-api-common';

import { GetDacOutput } from '../get-dac.output';
import { GetDacsOutput } from '../get-dacs.output';

/*imports*/
/*mocks*/

const dacDir = DacDirectory.fromStruct({
  accounts: [{ key: 2, value: 'dao.worlds' }],
  symbol: { sym: 'EYE', contract: '' },
  refs: [],
});

const dacTreasury = AlienWorldsContract.Deltas.Entities.Account.fromStruct({
  balance: 'string',
});

const dacGlobals = DaoWorldsContract.Deltas.Entities.DacGlobals.fromStruct({
  data: [],
});

const dacStats = TokenWorldsContract.Deltas.Entities.Stat.fromStruct({
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

  /*unit-tests*/
});
