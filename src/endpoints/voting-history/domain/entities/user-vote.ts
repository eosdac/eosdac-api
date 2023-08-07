import { Entity, UnknownObject } from '@alien-worlds/aw-core';

import { VoteAction } from '../user-voting-history.enums';

/**
 * Represents a user's vote entity.
 *
 * @class
 * @implements {Entity}
 */
export class UserVote implements Entity {
  /**
   * Creates a new UserVote entity with the provided properties.
   *
   * @static
   * @method
   * @param {string} dacId - The ID of the DAC (Decentralized Autonomous Community).
   * @param {string} voter - The ID of the voter.
   * @param {Date} voteTimestamp - The timestamp when the vote was made.
   * @param {string} candidate - The ID of the candidate the user voted for.
   * @param {number} candidateVotePower - The voting power used by the candidate during the vote.
   * @param {VoteAction} action - The type of voting action (e.g., Voted, Unvoted, etc.).
   * @param {string} [id] - The optional ID of the vote entity.
   * @param {UnknownObject} [rest] - Additional properties for the UserVote entity.
   * @returns {UserVote} The newly created UserVote entity.
   */
  public static create(
    dacId: string,
    voter: string,
    voteTimestamp: Date,
    candidate: string,
    candidateVotePower: number,
    action: VoteAction,
    id?: string,
    rest?: UnknownObject
  ): UserVote {
    const entity = new UserVote(
      dacId,
      voter,
      voteTimestamp,
      candidate,
      candidateVotePower,
      action,
      id
    );

    entity.rest = rest;

    return entity;
  }

  /**
   * Creates a new instance of UserVote.
   * @private
   * @constructor
   * @param {string} dacId - The ID of the DAC.
   * @param {string} voter - The ID of the voter.
   * @param {Date} voteTimestamp - The timestamp when the vote was made.
   * @param {string} candidate - The ID of the candidate the user voted for.
   * @param {number} candidateVotePower - The voting power used by the candidate during the vote.
   * @param {VoteAction} action - The type of voting action (e.g., Voted, Unvoted, etc.).
   * @param {string} [id] - The optional ID of the vote entity.
   */
  private constructor(
    public dacId: string,
    public voter: string,
    public voteTimestamp: Date,
    public candidate: string,
    public candidateVotePower: number,
    public action: VoteAction,
    public id?: string
  ) {}

  public rest?: UnknownObject;

  /**
   * Converts the UserVote entity to a JSON representation.
   *
   * @method
   * @returns {UnknownObject} The JSON representation of the UserVote entity.
   */
  public toJSON(): UnknownObject {
    throw new Error('Method not implemented.');
  }
}
