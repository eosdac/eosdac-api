import {
	AlienWorldsContract,
	DacDirectory,
	DaoWorldsContract,
	TokenWorldsContract,
} from '@alien-worlds/eosdac-api-common';

import { removeUndefinedProperties } from '@alien-worlds/api-core';

export class GetDacOutput {
	public static create(
		dacDirectory?: DacDirectory,
		dacTreasury?: AlienWorldsContract.Deltas.Entities.Account,
		dacGlobals?: DaoWorldsContract.Deltas.Entities.DacGlobals,
		dacStats?: TokenWorldsContract.Deltas.Entities.Stat
	): GetDacOutput {
		return new GetDacOutput(dacDirectory, dacTreasury, dacGlobals, dacStats);
	}

	private constructor(
		public readonly dacDirectory: DacDirectory,
		public readonly dacTreasury: AlienWorldsContract.Deltas.Entities.Account,
		public readonly dacGlobals: DaoWorldsContract.Deltas.Entities.DacGlobals,
		public readonly dacStats: TokenWorldsContract.Deltas.Entities.Stat
	) {}

	public toJson() {
		const { dacDirectory, dacTreasury, dacGlobals, dacStats } = this;

		const { id, dacId, owner, title, dacState, symbol, refs, accounts } =
			dacDirectory;

		const result: any = {
			id,
			dacId,
			owner,
			title,
			dacState,
			symbol: {
				contract: symbol.contract,
				code: symbol.code,
				precision: symbol.precision,
			},
			refs,
			accounts,
		};

		if (dacTreasury) {
			result.dacTreasury = {
				balance: dacTreasury.balance,
			};
		}

		if (dacStats) {
			result.dacStats = {
				supply: dacStats.supply,
				maxSupply: dacStats.maxSupply,
				issuer: dacStats.issuer,
				transferLocked: dacStats.transferLocked,
			};
		}

		if (dacGlobals) {
			result.dacGlobals = dacGlobals.data;
		}

		return removeUndefinedProperties(result);
	}
}
