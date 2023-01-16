import { ObjectId, removeUndefinedProperties } from '@alien-worlds/api-core';
import { UserVotingHistoryDocument, VoteAction } from '../../data/dtos/user-voting-history.dto';

/**
 * Represents schema smart contract data
 *
 * @class
 */
export class UserVote {
  /**
   * @private
   * @constructor
   */
  private constructor(
    public readonly id: string,
    public readonly dacId: string,
    public readonly voter: string,
    public readonly voteTimestamp: Date,
    public readonly candidate: string,
    public readonly candidateVotePower: number,
    public readonly action: VoteAction,
  ) { }

  /**
   * @returns {UserVotingHistoryDocument}
   */
  public toDocument(): UserVotingHistoryDocument {
    const {
      id,
      dacId,
      voter,
      candidate,
      candidateVotePower,
      action,
      voteTimestamp,
    } = this;

    const document: UserVotingHistoryDocument = {
      dac_id: dacId,
      voter,
      vote_timestamp: voteTimestamp,
      action,
      candidate_vote_power: candidateVotePower,
      candidate,
    };

    if (id) {
      document._id = new ObjectId(id);
    }

    return removeUndefinedProperties<UserVotingHistoryDocument>(document);
  }

  /**
   * Get Schema smart contract data based on table row.
   *
   * @static
   * @param {UserVotingHistoryDocument} dto
   * @returns {UserVote}
   */
  public static fromDocument(dto: UserVotingHistoryDocument): UserVote {
    const {
      _id,
      dac_id,
      candidate,
      vote_timestamp,
      action,
      voter,
      candidate_vote_power,
    } = dto;

    return new UserVote(
      _id instanceof ObjectId ? _id.toString() : '',
      dac_id,
      voter,
      new Date(vote_timestamp),
      candidate,
      candidate_vote_power,
      action,
    );
  }

  /**
   * @static
   * @returns {UserVote}
   */
  public static create(
    id: string,
    dacId: string,
    voter: string,
    voteTimestamp: Date,
    candidate: string,
    candidateVotePower: number,
    action: VoteAction,
  ): UserVote {
    return new UserVote(
      id,
      dacId,
      voter,
      voteTimestamp,
      candidate,
      candidateVotePower,
      action
    );
  }
}
