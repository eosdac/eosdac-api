import * as DaoWorldsCommon from '@alien-worlds/aw-contract-dao-worlds';
import * as TokenWorldsContract from '@alien-worlds/aw-contract-token-worlds';
import { Entity, UnknownObject } from '@alien-worlds/aw-core';
import { Asset } from '@alien-worlds/aw-antelope';
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
  ): CandidateProfile {
    const {
      candidateName,
      requestedpay,
      numberVoters,
      isActive,
      avgVoteTimeStamp,
      rank,
      totalVotePower,
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
      !!isActive,
      numberVoters,
      voteDecay,
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
    public readonly rank: number,
    public readonly isActive: boolean,
    public readonly totalVotes: number,
    public readonly voteDecay: number,
    public readonly profile: object,
    public readonly signedDaoTermsVersion: number,
    public readonly hasSignedCurrentDaoTerms: boolean,
    public readonly isFlagged: boolean,
    public readonly dacId: string
  ) {}

  id?: string;
  rest?: UnknownObject;

  public toJSON(): UnknownObject {
    const {
      account,
      requestedPay,
      votePower,
      rank,
      isActive,
      totalVotes,
      voteDecay,
      signedDaoTermsVersion,
      hasSignedCurrentDaoTerms,
      isFlagged,
      dacId,
      profile
    } = this;


    return {
      ...profile,
      account,
      requestedpay: `${requestedPay.value} ${requestedPay.symbol}`,
      votePower: Number(votePower.toFixed(0)),
      rank: Number(rank),
      isActive,
      totalVotes,
      voteDecay,
      signedDaoTermsVersion,
      hasSignedCurrentDaoTerms,
      isFlagged,
      dacId,
    };
  }
}
