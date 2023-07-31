import {
  DacAccountIndex,
  DacAccountKey,
} from '@endpoints/dacs/domain/dac.enums';

import { DacAccounts } from '@endpoints/dacs/domain/entities/dac-accounts';
import { Pair } from '@alien-worlds/aw-antelope';

/**
 * The `DacAccountsMapper` class is responsible for converting a list of key-value pairs into a `DacAccounts` object,
 * which represents the various DAC accounts with their respective balances.
 */
export class DacAccountsMapper {
  private accountKeys = new Map<DacAccountIndex, DacAccountKey>([
    [DacAccountIndex.Activation, DacAccountKey.Activation],
    [DacAccountIndex.Auth, DacAccountKey.Auth],
    [DacAccountIndex.Custodian, DacAccountKey.Custodian],
    [DacAccountIndex.Escrow, DacAccountKey.Escrow],
    [DacAccountIndex.VoteWeight, DacAccountKey.VoteWeight],
    [DacAccountIndex.External, DacAccountKey.External],
    [DacAccountIndex.MsigOwned, DacAccountKey.MsigOwned],
    [DacAccountIndex.Other, DacAccountKey.Other],
    [DacAccountIndex.Proposals, DacAccountKey.Proposals],
    [DacAccountIndex.Referendum, DacAccountKey.Referendum],
    [DacAccountIndex.Service, DacAccountKey.Service],
    [DacAccountIndex.Spendings, DacAccountKey.Spendings],
    [DacAccountIndex.Treasury, DacAccountKey.Treasury],
  ]);

  /**
   * Converts a list of key-value pairs into a `DacAccounts` object.
   * @param {Pair[]} accounts - The list of key-value pairs representing the DAC accounts and their balances.
   * @returns {DacAccounts} - The DacAccounts object representing the DAC accounts with their balances.
   */
  public toDacAccounts(accounts: Pair[]): DacAccounts {
    const data = {},
      rest = {};
    accounts.forEach(account => {
      const label = DacAccountKey[DacAccountIndex[account.key]];
      if (label) {
        data[label] = account.value;
      } else {
        rest[account.key] = account.value;
      }
    });

    return DacAccounts.create(
      data[DacAccountKey.Auth],
      data[DacAccountKey.Treasury],
      data[DacAccountKey.Custodian],
      data[DacAccountKey.MsigOwned],
      data[DacAccountKey.Service],
      data[DacAccountKey.Proposals],
      data[DacAccountKey.Escrow],
      data[DacAccountKey.VoteWeight],
      data[DacAccountKey.Activation],
      data[DacAccountKey.Referendum],
      data[DacAccountKey.Spendings],
      data[DacAccountKey.External],
      data[DacAccountKey.Other],
      null,
      rest
    );
  }
}
