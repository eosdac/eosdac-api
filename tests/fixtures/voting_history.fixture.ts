export const votingHistoryEmptyResponse = { results: [], count: 0 };

export const missingDacIdErrorResponse = {
  message: 'bad request',
  errors: ["/query must have required property 'dacId'"],
};

export const missingVoterErrorResponse = {
  message: 'bad request',
  errors: ["/query must have required property 'voter'"],
};
