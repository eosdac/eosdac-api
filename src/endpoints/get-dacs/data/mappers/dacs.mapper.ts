import * as IndexWorldsCommon from '@alien-worlds/index-worlds-common';

import { Dac } from '@endpoints/get-dacs/domain/entities/dacs';
import { DacAccountsMapper } from './dac-accounts.mapper';
import { DacRefsMapper } from './dac-refs.mappers';

export class DacMapper {
  public toDac(indexWorldsDac: IndexWorldsCommon.Deltas.Entities.Dacs): Dac {
    const {
      owner,
      dacId,
      title,
      symbol,
      refs,
      accounts,
      dacState,
      id,
      ...rest
    } = indexWorldsDac;
    return Dac.create(
      owner,
      dacId,
      title,
      symbol,
      new DacRefsMapper().toDacRefs(refs),
      new DacAccountsMapper().toDacAccounts(accounts),
      dacState,
      id,
      rest
    );
  }
}
