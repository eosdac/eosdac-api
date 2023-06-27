import { Entity, UnknownObject } from '@alien-worlds/api-core';

import { DacAccounts } from './dac-accounts';
import { DacRefs } from './dac-refs';
import { ExtendedSymbol } from '@alien-worlds/eosio-contract-types';

/**
 * Represents a `Dac` object.
 *
 * @class
 */
export class Dac implements Entity {
  /**
   * Constructs a new instance of the `Dac` class.
   *
   * @public
   * @constructor
   * @param string owner
   * @param string dacId
   * @param string title
   * @param ExtendedSymbol symbol
   * @param DacRefs refs
   * @param DacAccounts accounts
   * @param number dacState
   * @param string [id]
   * @returns `Dac` - An instance of the `Dac` class.
   */
  public constructor(
    public owner: string,
    public dacId: string,
    public title: string,
    public symbol: ExtendedSymbol,
    public refs: DacRefs,
    public accounts: DacAccounts,
    public dacState: number,
    public id?: string
  ) {}

  public rest?: UnknownObject;

  /**
   * Converts the current instance of the `Dac` class to a JSON object.
   *
   * @public
   * @returns {UnknownObject} The JSON representation of the instance.
   */
  public toJSON(): UnknownObject {
    return {
      owner: this.owner,
      dacId: this.dacId,
      title: this.title,
      symbol: this.symbol,
      refs: this.refs.toJSON(),
      accounts: this.accounts.toJSON(),
      dacState: this.dacState,
    };
  }

  /**
   * Creates an instance of the `Dac` class.
   *
   * @static
   * @public
   * @returns `Dac` An instance of the `Dac` class.
   */
  public static create(
    owner: string,
    dacId: string,
    title: string,
    symbol: ExtendedSymbol,
    refs: DacRefs,
    accounts: DacAccounts,
    dacState: number,
    id?: string,
    rest?: UnknownObject
  ): Dac {
    const entity = new Dac(
      owner,
      dacId,
      title,
      symbol,
      refs,
      accounts,
      dacState,
      id
    );
    entity.rest = rest;

    return entity;
  }

  public static getDefault(): Dac {
    return new Dac(
      '',
      '',
      '',
      ExtendedSymbol.getDefault(),
      DacRefs.getDefault(),
      DacAccounts.getDefault(),
      0
    );
  }
}
