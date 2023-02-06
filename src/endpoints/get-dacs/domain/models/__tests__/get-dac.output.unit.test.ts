import {
	AlienWorldsContract,
	DacDirectory,
	DaoWorldsContract,
	TokenWorldsContract,
} from '@alien-worlds/eosdac-api-common';

import { GetDacOutput } from '../get-dac.output';

/*imports*/
/*mocks*/

const dacDir = DacDirectory.fromStruct({
	accounts: [{ key: 2, value: 'dao.worlds' }],
	symbol: { sym: 'EYE', contract: '' },
	refs: [],
});
const dacTreasury = AlienWorldsContract.Deltas.Entities.Account.fromStruct({});
const dacGlobals = DaoWorldsContract.Deltas.Entities.DacGlobals.fromStruct({});
const dacStats = TokenWorldsContract.Deltas.Entities.Stat.fromStruct({});

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

	/*unit-tests*/
});
