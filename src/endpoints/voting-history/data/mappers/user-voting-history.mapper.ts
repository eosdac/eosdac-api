import { Mapper } from '@alien-worlds/api-core';
import { UserVote } from '../../domain/entities/user-vote';
import { UserVotingHistoryDocument } from '../dtos/user-voting-history.dto';

export class UserVotingHistoryMapper
  implements Mapper<UserVote, UserVotingHistoryDocument>
{
  public toEntity(document: UserVotingHistoryDocument): UserVote {
    return UserVote.fromDocument(document);
  }
  public toDataObject(entity: UserVote): UserVotingHistoryDocument {
    return entity.toDocument();
  }
}
