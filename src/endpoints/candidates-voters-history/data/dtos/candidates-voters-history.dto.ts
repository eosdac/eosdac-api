export type CandidatesVotersHistoryRequestQueryParams = {
  dacId: string;
  candidateId: string;
  skip?: number;
  limit?: number;
};

export type VotesModel = {
  results: VoteModel[];
  total: number;
};

export type VoteModel = {
  voter: string;
  votingPower: number;
  action?: string;
  candidate: string;
  voteTimestamp: Date;
  transactionId: string;
};
