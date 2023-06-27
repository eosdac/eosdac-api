import * as AlienWorldsCommon from '@alien-worlds/alien-worlds-common';
import * as DaoWorldsCommon from '@alien-worlds/dao-worlds-common';
import * as TokenWorldsCommon from '@alien-worlds/token-worlds-common';

import {
  removeUndefinedProperties,
  UnknownObject,
} from '@alien-worlds/api-core';

import { AssetRawMapper } from '@alien-worlds/eosio-contract-types';
import { Dac } from '../entities/dacs';

export class GetDacOutput {
  public static create(
    dac?: Dac,
    dacTreasury?: AlienWorldsCommon.Deltas.Entities.Accounts,
    dacGlobals?: DaoWorldsCommon.Deltas.Entities.Dacglobals,
    dacStats?: TokenWorldsCommon.Deltas.Entities.Stat
  ): GetDacOutput {
    return new GetDacOutput(dac, dacTreasury, dacGlobals, dacStats);
  }

  private constructor(
    public readonly dac: Dac,
    public readonly dacTreasury: AlienWorldsCommon.Deltas.Entities.Accounts,
    public readonly dacGlobals: DaoWorldsCommon.Deltas.Entities.Dacglobals,
    public readonly dacStats: TokenWorldsCommon.Deltas.Entities.Stat
  ) {}

  public toJson(): UnknownObject {
    const { dac, dacTreasury, dacGlobals, dacStats } = this;

    const { id, dacId, owner, title, dacState, symbol, refs, accounts } = dac;

    const result: UnknownObject = {
      id,
      dacId,
      owner,
      title,
      dacState,
      symbol: {
        contract: symbol.contract,
        code: symbol.symbol.code,
        precision: symbol.symbol.precision,
      },
      refs,
      accounts,
    };

    const assetRawMapper = new AssetRawMapper();

    if (dacTreasury) {
      result.dacTreasury = {
        balance: assetRawMapper.fromEntity(dacTreasury.balance),
      };
    }

    if (dacStats) {
      result.dacStats = {
        supply: assetRawMapper.fromEntity(dacStats.supply),
        maxSupply: assetRawMapper.fromEntity(dacStats.maxSupply),
        issuer: dacStats.issuer,
        transferLocked: dacStats.transferLocked,
      };
    }

    if (dacGlobals) {
      result.dacGlobals = dacGlobals.data.map(dg => dg.toJSON());
    }

    return removeUndefinedProperties(result);
  }
}
