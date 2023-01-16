import { injectable } from 'inversify';
import { Repository } from '@alien-worlds/api-core';
import { UserVote } from '../entities/user-vote';
import { UserVotingHistoryDocument } from '../../data/dtos/user-voting-history.dto';

/**
 * @abstract
 * @class
 */
@injectable()
export abstract class UserVotingHistoryRepository extends Repository<
  UserVote,
  UserVotingHistoryDocument
> {
  public static Token = 'USER_VOTING_HISTORY_REPOSITORY';
}
