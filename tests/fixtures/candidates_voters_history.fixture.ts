export const candidatesVotingHistoryEmptyResponse = { results: [], total: 0 };

export const missingDacIdErrorResponse = {
  message: 'bad request',
  errors: ["/query must have required property 'dacId'"],
};

export const missingCandidateIdErrorResponse = {
  message: 'bad request',
  errors: ["/query must have required property 'candidateId'"],
};
