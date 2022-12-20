import { AlienWorldsAccount, DacDirectory, DacGlobals, Stat } from '@alien-worlds/eosdac-api-common';

import { GetDacOutput } from '../get-dac.output';

/*imports*/
/*mocks*/

const dacDir = DacDirectory.fromTableRow({
	accounts: [{ key: 2, value: 'dao.worlds' }],
	symbol: { sym: 'EYE', contract: '' },
	refs: [],
})
const dacTreasury = AlienWorldsAccount.fromTableRow({})
const dacGlobals = DacGlobals.fromTableRow({})
const dacStats = Stat.fromTableRow({})

describe('GetDacOutput Unit tests', () => {
	it('"GetDacOutput.create" should create instance', async () => {
		const output = GetDacOutput.create(dacDir, dacTreasury, dacGlobals, dacStats);

		expect(output).toBeInstanceOf(GetDacOutput);
	});

	it('GetDacOutput.toJson should return json object', async () => {
		const output = GetDacOutput.create(dacDir, dacTreasury, dacGlobals, dacStats);

		expect(output.toJson()).toBeInstanceOf(Object);
	});

	/*unit-tests*/
});
