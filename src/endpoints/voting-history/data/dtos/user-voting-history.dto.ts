import { MongoDB } from '@alien-worlds/aw-storage-mongodb';
import { VoteAction } from '@endpoints/voting-history/domain/user-voting-history.enums';

export type VotingHistoryRequestQueryParams = {
  dacId: string;
  voter: string;
  skip?: number;
  limit?: number;
};

export type VotingHistoryOutputItem = {
  dacId: string;
  voter: string;
  voteTimestamp: Date;
  candidate: string;
  candidateVotePower: number;
  action: VoteAction;
};

export type VotingHistoryOutput = {
  results: VotingHistoryOutputItem[];
  count: number;
};

export type UserVotingHistoryMongoModel = {
  _id?: MongoDB.ObjectId;
  dac_id: string;
  voter: string;
  vote_timestamp: Date;
  action: VoteAction;
  candidate: string;
  candidate_vote_power: number;
  [key: string]: unknown;
};
