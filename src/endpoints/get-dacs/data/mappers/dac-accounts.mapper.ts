import {
  DacAccountIndex,
  DacAccountKey,
} from '@endpoints/get-dacs/domain/dac.enums';

import { DacAccounts } from '@endpoints/get-dacs/domain/entities/dac-accounts';
import { Pair } from '@alien-worlds/eosio-contract-types';

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
