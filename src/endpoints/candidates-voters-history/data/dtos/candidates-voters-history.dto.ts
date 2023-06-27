export type CandidatesVotersHistoryRequestQueryParams = {
  dacId: string;
  candidateId: string;
  skip?: number;
  limit?: number;
};

export type CandidatesVotersHistoryControllerOutput = {
  results: CandidatesVotersHistoryOutputItem[];
  total: number;
};

export type CandidatesVotersHistoryOutputItem = {
  voter: string;
  votingPower: number;
  action?: string;
  candidate: string;
  voteTimestamp: Date;
  transactionId: string;
};
