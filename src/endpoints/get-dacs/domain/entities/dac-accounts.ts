import { Entity, UnknownObject } from '@alien-worlds/aw-core';

/**
 * Represents a `DacAccounts` object.
 *
 * @class
 */
export class DacAccounts implements Entity {
  /**
   * Constructs a new instance of the `DacAccounts` class.
   *
   * @public
   * @constructor
   * @param string auth
   * @param string treasury
   * @param string custodian
   * @param string msigOwned
   * @param string service
   * @param string proposals
   * @param string escrow
   * @param string voteWeight
   * @param string activation
   * @param string referendum
   * @param string spendings
   * @param string external
   * @param string other
   * @param string [id]
   * @returns `DacAccounts` - An instance of the `DacAccounts` class.
   */
  public constructor(
    public auth: string,
    public treasury: string,
    public custodian: string,
    public msigOwned: string,
    public service: string,
    public proposals: string,
    public escrow: string,
    public voteWeight: string,
    public activation: string,
    public referendum: string,
    public spendings: string,
    public external: string,
    public other: string,
    public id?: string
  ) {}

  public rest?: UnknownObject;

  /**
   * Converts the current instance of the `DacAccounts` class to a JSON object.
   *
   * @public
   * @returns {UnknownObject} The JSON representation of the instance.
   */
  public toJSON(): UnknownObject {
    const {
      auth,
      treasury,
      custodian,
      msigOwned,
      service,
      proposals,
      escrow,
      voteWeight,
      activation,
      referendum,
      spendings,
      external,
      other,
    } = this;

    return {
      auth,
      treasury,
      custodian,
      msigOwned,
      service,
      proposals,
      escrow,
      voteWeight,
      activation,
      referendum,
      spendings,
      external,
      other,
    };
  }

  /**
   * Creates an instance of the `DacAccounts` class.
   *
   * @static
   * @public
   * @returns `DacAccounts` An instance of the `DacAccounts` class.
   */
  public static create(
    auth: string,
    treasury: string,
    custodian: string,
    msigOwned: string,
    service: string,
    proposals: string,
    escrow: string,
    voteWeight: string,
    activation: string,
    referendum: string,
    spendings: string,
    external: string,
    other: string,
    id?: string,
    rest?: UnknownObject
  ): DacAccounts {
    const entity = new DacAccounts(
      auth,
      treasury,
      custodian,
      msigOwned,
      service,
      proposals,
      escrow,
      voteWeight,
      activation,
      referendum,
      spendings,
      external,
      other,
      id
    );
    entity.rest = rest;

    return entity;
  }

  public static getDefault(): DacAccounts {
    return new DacAccounts('', '', '', '', '', '', '', '', '', '', '', '', '');
  }
}
