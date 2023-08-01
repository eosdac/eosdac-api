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
   * @param {string} dacId - The ID of the DAC.
   * @param {DaoWorldsCommon.Deltas.Entities.Candidates} candidate - The candidate data from the DAO worlds contract.
   * @param {Profile} profile - The profile data of the candidate.
   * @param {TokenWorldsContract.Deltas.Entities.Memberterms} memberTerms - The member terms data from the token worlds contract.
   * @param {number} agreedTermsVersion - The version of the agreed terms.
   * @returns {CandidateProfile} - The created CandidateProfile instance.
   */
  public static create(
    dacId: string,
    candidate: DaoWorldsCommon.Deltas.Entities.Candidates,
    profile: Profile,
    memberTerms: TokenWorldsContract.Deltas.Entities.Memberterms,
    agreedTermsVersion: number
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
   * @param {string} account - The account of the candidate.
   * @param {Asset} requestedPay - The requested pay as an Asset object.
   * @param {number} votePower - The vote power of the candidate.
   * @param {number} rank - The rank of the candidate.
   * @param {boolean} isActive - Indicates whether the candidate is active.
   * @param {number} totalVotes - The total number of votes received by the candidate.
   * @param {number} voteDecay - The vote decay value of the candidate.
   * @param {object} profile - The profile data of the candidate.
   * @param {number} signedDaoTermsVersion - The version of the signed DAO terms.
   * @param {boolean} hasSignedCurrentDaoTerms - Indicates whether the candidate has signed the current DAO terms.
   * @param {boolean} isFlagged - Indicates whether the candidate is flagged.
   * @param {string} dacId - The ID of the DAC.
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

  public id?: string;
  public rest?: UnknownObject;

  /**
   * Converts the CandidateProfile object to a plain JavaScript object.
   *
   * @public
   * @returns {UnknownObject} - The plain JavaScript object representing the CandidateProfile.
   */
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
      profile,
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
