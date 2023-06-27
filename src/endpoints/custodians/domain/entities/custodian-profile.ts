import * as DaoWorldsContract from '@alien-worlds/dao-worlds-common';
import * as TokenWorldsContract from '@alien-worlds/token-worlds-common';

import { Entity, UnknownObject } from '@alien-worlds/api-core';

import { Asset } from '@alien-worlds/eosio-contract-types';
import { Profile } from '../../../profile/domain/entities/profile';

/**
 * Represents Custodian Profile data entity.
 * @class
 */
export class CustodianProfile implements Entity {
  /**
   * Creates instances of Custodian based on a given DTO.
   *
   * @static
   * @public
   * @returns {CustodianProfile}
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
      profile?.profile,
      agreedTermsVersion,
      Number(version) === agreedTermsVersion,
      !!profile?.error,
      false,
      dacId
    );
  }

  /**
   * @private
   * @constructor
   */
  private constructor(
    public readonly walletId: string,
    public readonly requestedpay: Asset,
    public readonly votePower: number,
    public readonly profile: object,
    public readonly agreedTermVersion: number,
    public readonly currentPlanetMemberTermsSignedValid: boolean,
    public readonly isFlagged: boolean,
    public readonly isSelected: boolean,
    public readonly planetName: string
  ) {}

  id?: string;
  rest?: UnknownObject;

  public toJSON(): UnknownObject {
    const {
      walletId,
      requestedpay,
      votePower,
      profile,
      agreedTermVersion,
      currentPlanetMemberTermsSignedValid,
      isFlagged,
      isSelected,
      planetName,
    } = this;

    const p = profile || {};

    return {
      walletId,
      requestedpay: `${requestedpay.value} ${requestedpay.symbol}`,
      votePower: Number(votePower.toFixed(0)),
      ...p,
      agreedTermVersion,
      currentPlanetMemberTermsSignedValid,
      isFlagged,
      isSelected,
      planetName,
    };
  }
}
