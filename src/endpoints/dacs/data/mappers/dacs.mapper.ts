import * as IndexWorldsCommon from '@alien-worlds/aw-contract-index-worlds';

import { Dac } from '@endpoints/dacs/domain/entities/dacs';
import { DacAccountsMapper } from './dac-accounts.mapper';
import { DacRefsMapper } from './dac-refs.mappers';

/**
 * The `DacMapper` class is responsible for converting an object representing a DAC from the Index Worlds contract
 * into a `Dac` object, which is a domain entity that represents a DAC.
 */
export class DacMapper {
  /**
   * Converts an object representing a DAC from the Index Worlds contract into a `Dac` object.
   * @param {IndexWorldsCommon.Deltas.Entities.Dacs} indexWorldsDac - The object representing the DAC from the Index Worlds contract.
   * @returns {Dac} - The `Dac` object representing the DAC.
   */
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
