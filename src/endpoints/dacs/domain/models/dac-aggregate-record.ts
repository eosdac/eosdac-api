import { AssetRawMapper, Pair } from '@alien-worlds/aw-antelope';
import * as AlienWorldsCommon from '@alien-worlds/aw-contract-alien-worlds';
import * as DaoWorldsCommon from '@alien-worlds/aw-contract-dao-worlds';
import * as TokenWorldsCommon from '@alien-worlds/aw-contract-token-worlds';
import {
  removeUndefinedProperties,
  UnknownObject,
} from '@alien-worlds/aw-core';
import { camelCase } from 'change-case';

import { Dac } from '../entities/dacs';

/**
 * The `DacAggregateRecord` class is responsible for creating an aggregated record that contains information about a DAC
 * and its related data.
 */
export class DacAggregateRecord {
  public static create(
    dac?: Dac,
    dacTreasury?: AlienWorldsCommon.Deltas.Entities.Accounts,
    dacGlobals?: DaoWorldsCommon.Deltas.Entities.Dacglobals,
    dacStats?: TokenWorldsCommon.Deltas.Entities.Stat
  ): DacAggregateRecord {
    return new DacAggregateRecord(dac, dacTreasury, dacGlobals, dacStats);
  }

  /**
   *
   * @private
   * @constructor
   * @param dac
   * @param dacTreasury
   * @param dacGlobals
   * @param dacStats
   */
  private constructor(
    public readonly dac: Dac,
    public readonly dacTreasury: AlienWorldsCommon.Deltas.Entities.Accounts,
    public readonly dacGlobals: DaoWorldsCommon.Deltas.Entities.Dacglobals,
    public readonly dacStats: TokenWorldsCommon.Deltas.Entities.Stat
  ) {}

  /**
   * Converts the `DacAggregateRecord` into a JSON representation.
   * @returns {UnknownObject} - The JSON representation of the `DacAggregateRecord`.
   */
  public toJSON(): UnknownObject {
    const { dac, dacTreasury, dacGlobals, dacStats } = this;
    const { dacId, owner, title, dacState, symbol, accounts } = dac;

    const refs = {};

    if (dac.refs) {
      const {
        refs: { rest, ...props },
      } = dac;

      Object.assign(refs, props);
      if (rest) {
        Object.keys(rest).forEach(key => {
          refs[key] = rest[key];
        });
      }
    }

    const result: UnknownObject = {
      dacId,
      owner,
      title,
      isDacActive: Boolean(dacState),
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
      result.electionGlobals = {};

      dacGlobals.data.forEach(eg => {
        const { second, value } = eg;

        let formattedValue;
        if (value && Array.isArray(value) && value.length > 1) {
          formattedValue = value[1];
        } else if (second && Array.isArray(second) && second.length > 1) {
          formattedValue = second[1];
        }

        result.electionGlobals[this.getKeyName(eg)] = formattedValue;
      });
    }

    return removeUndefinedProperties(result);
  }

  private getKeyName = (electionGlobal: Pair<string, string>): string => {
    const { key, first } = electionGlobal;

    let result = camelCase(key || first);

    switch (result) {
      case 'lastclaimbudgettime':
        result = 'lastClaimBudgetTime';
        break;
      case 'lastperiodtime':
        result = 'lastPeriodTime';
        break;
      case 'lockupasset':
        result = 'lockupAsset';
        break;
      case 'maxvotes':
        result = 'maxVotes';
        break;
      case 'numelected':
        result = 'numElected';
        break;
      case 'periodlength':
        result = 'periodLength';
        break;
    }

    return result;
  };
}
