import * as DaoWorldsCommon from '@alien-worlds/dao-worlds-common';
import * as TokenWorldsContract from '@alien-worlds/token-worlds-common';

import { Entity, UnknownObject } from '@alien-worlds/api-core';

import { Asset } from '@alien-worlds/eosio-contract-types';
import { Profile } from './../../../profile/domain/entities/profile';

/**
 * Represents Candidate Profile data entity.
 * @class
 */
export class CandidateProfile implements Entity {
  /**
   * Creates instances of Candidate based on a given DTO.
   *
   * @static
   * @public
   * @returns {CandidateProfile}
   */
  public static create(
    dacId: string,
    candidate: DaoWorldsCommon.Deltas.Entities.Candidates,
    profile: Profile,
    memberTerms: TokenWorldsContract.Deltas.Entities.Memberterms,
    agreedTermsVersion: number,
    votedCandidates: string[]
  ): CandidateProfile {
    const {
      candidateName,
      requestedpay,
      numberVoters,
      isActive,
      avgVoteTimeStamp,
      rank,
      totalVotePower,
      gapFiller,
    } = candidate;

    const { version } = memberTerms;

    const voteDecay =
      new Date(avgVoteTimeStamp).getFullYear() > 1970
        ? Math.ceil(
            (new Date().getTime() - new Date(avgVoteTimeStamp).getTime()) /
              (3600 * 24 * 1000)
          )
        : null;
    const votePower = totalVotePower / 10000;

    return new CandidateProfile(
      candidateName,
      requestedpay,
      votePower,
      rank,
      gapFiller,
      !!isActive,
      numberVoters,
      voteDecay,
      profile?.profile,
      agreedTermsVersion,
      Number(version) === agreedTermsVersion,
      !!profile?.error,
      false,
      votedCandidates.includes(candidateName),
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
    public readonly requestedPay: Asset,
    public readonly votePower: number,
    public readonly rank: number,
    public readonly gapFiller: number,
    public readonly isActive: boolean,
    public readonly totalVotes: number,
    public readonly voteDecay: number,
    public readonly profile: object,
    public readonly agreedTermVersion: number,
    public readonly currentPlanetMemberTermsSignedValid: boolean,
    public readonly isFlagged: boolean,
    public readonly isSelected: boolean,
    public readonly isVoted: boolean,
    public readonly isVoteAdded: boolean,
    public readonly planetName: string
  ) {}

  id?: string;
  rest?: UnknownObject;

  public toJSON(): UnknownObject {
    const {
      walletId,
      requestedPay,
      votePower,
      rank,
      gapFiller,
      isActive,
      totalVotes,
      voteDecay,
      profile,
      agreedTermVersion,
      currentPlanetMemberTermsSignedValid,
      isFlagged,
      isSelected,
      isVoted,
      isVoteAdded,
      planetName,
    } = this;

    const p = profile || {};

    return {
      ...p,
      walletId,
      requestedpay: `${requestedPay.value} ${requestedPay.symbol}`,
      votePower: Number(votePower.toFixed(0)),
      rank: Number(rank),
      gapFiller: Number(gapFiller),
      isActive: Number(isActive),
      totalVotes,
      voteDecay,
      agreedTermVersion,
      currentPlanetMemberTermsSignedValid,
      isFlagged,
      isSelected,
      isVoted,
      isVoteAdded,
      planetName,
    };
  }
}
