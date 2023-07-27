import { MapperImpl, parseToBigInt } from '@alien-worlds/aw-core';

import { MongoDB } from '@alien-worlds/aw-storage-mongodb';
import { UserVote } from '@endpoints/voting-history/domain/entities/user-vote';
import { UserVotingHistoryMongoModel } from '../dtos/user-voting-history.dto';
import { VoteAction } from '@endpoints/voting-history/domain/user-voting-history.enums';

// Mongo Mappers
export class UserVoteMongoMapper extends MapperImpl<
  UserVote,
  UserVotingHistoryMongoModel
> {
  constructor() {
    super();

    this.mappingFromEntity.set('dacId', {
      key: 'dac_id',
      mapper: (value: string) => value,
    });

    this.mappingFromEntity.set('voter', {
      key: 'voter',
      mapper: (value: string) => value,
    });

    this.mappingFromEntity.set('voteTimestamp', {
      key: 'vote_timestamp',
      mapper: (value: Date) => value,
    });

    this.mappingFromEntity.set('candidate', {
      key: 'candidate',
      mapper: (value: string) => value,
    });

    this.mappingFromEntity.set('candidateVotePower', {
      key: 'candidate_vote_power',
      mapper: (value: bigint) => MongoDB.Long.fromBigInt(value),
    });

    this.mappingFromEntity.set('action', {
      key: 'action',
      mapper: (value: VoteAction) => value,
    });
  }

  public toEntity(mongoModel: UserVotingHistoryMongoModel): UserVote {
    const {
      dac_id,
      voter,
      vote_timestamp,
      action,
      candidate,
      candidate_vote_power,
      _id,
      ...rest
    } = mongoModel;

    return UserVote.create(
      dac_id ?? '',
      voter ?? '',
      vote_timestamp ?? new Date(0),
      candidate ?? '',
      candidate_vote_power ?? 0,
      action ?? VoteAction.Voted,
      _id instanceof MongoDB.ObjectId ? _id.toString() : undefined,
      rest
    );
  }
}
