import * as DaoWorldsContract from '@alien-worlds/aw-contract-dao-worlds';
import * as TokenWorldsContract from '@alien-worlds/aw-contract-token-worlds';

import { Entity, UnknownObject } from '@alien-worlds/aw-core';

import { Asset } from '@alien-worlds/aw-antelope';
import { Profile } from '../../../profile/domain/entities/profile';

/**
 * Represents Custodian Profile data entity.
 * @class
 */
export class CustodianProfile implements Entity {
  /**
   * Creates instances of CustodianProfile based on a given DTO.
   *
   * @static
   * @public
   * @param {string} dacId - The ID of the DAC.
   * @param {DaoWorldsContract.Deltas.Entities.Custodians1} custodian - The DTO containing custodian data.
   * @param {Profile} profile - The profile entity.
   * @param {TokenWorldsContract.Deltas.Entities.Memberterms} memberTerms - The member terms entity.
   * @param {number} agreedTermsVersion - The agreed terms version number.
   * @returns {CustodianProfile} - The created CustodianProfile instance.
   */
  public static create(
    dacId: string,
    custodian: DaoWorldsContract.Deltas.Entities.Custodians1,
    profile: Profile,
    memberTerms: TokenWorldsContract.Deltas.Entities.Memberterms,
    agreedTermsVersion: number
  ): CustodianProfile {
    const { custName, requestedpay, totalVotePower } = custodian;

    const { version } = memberTerms;
    const votePower = totalVotePower / 10000;

    return new CustodianProfile(
      custName,
      requestedpay,
      Number(votePower),
      profile?.profile || {},
      agreedTermsVersion,
      Number(version) === agreedTermsVersion,
      !!profile?.error,
      dacId
    );
  }

  /**
   * @private
   * @constructor
   */
  private constructor(
    public readonly account: string,
    public readonly requestedPay: Asset,
    public readonly votePower: number,
    public readonly profile: object,
    public readonly signedDaoTermsVersion: number,
    public readonly hasSignedCurrentDaoTerms: boolean,
    public readonly isFlagged: boolean,
    public readonly dacId: string
  ) {}

  public id?: string;
  public rest?: UnknownObject;

  /**
   * Converts the CustodianProfile instance to a JSON representation.
   *
   * @public
   * @returns {UnknownObject} - The JSON representation of the CustodianProfile.
   */
  public toJSON(): UnknownObject {
    const {
      account,
      requestedPay,
      votePower,
      profile,
      signedDaoTermsVersion,
      hasSignedCurrentDaoTerms,
      isFlagged,
      dacId,
    } = this;

    return {
      ...profile,
      account,
      requestedpay: `${requestedPay.value} ${requestedPay.symbol}`,
      votePower: Number(votePower.toFixed(0)),
      signedDaoTermsVersion,
      hasSignedCurrentDaoTerms,
      isFlagged,
      dacId,
    };
  }
}
