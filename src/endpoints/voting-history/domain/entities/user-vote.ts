import { Entity, UnknownObject } from '@alien-worlds/api-core';

import { VoteAction } from '../user-voting-history.enums';

/**
 * Represents schema smart contract data
 *
 * @class
 */
export class UserVote implements Entity {
  /**
   * @private
   * @constructor
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

  rest?: UnknownObject;

  toJSON(): UnknownObject {
    throw new Error('Method not implemented.');
  }

  /**
   * @static
   * @returns {UserVote}
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
}
