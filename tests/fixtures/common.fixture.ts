export const InvalidLimitValueErrorResponse = {
  message: 'bad request',
  errors: ['/query/limit must be >= 1'],
};

export const InvalidSkipValueErrorResponse = {
  message: 'bad request',
  errors: ['/query/skip must be >= 0'],
};

export const DacIdShortLengthErrorResponse = {
  message: 'bad request',
  errors: ['/query/dacId must NOT have fewer than 5 characters'],
};

export const DacIdPathParamMissingErrorResponse = {
  message: 'bad request',
  errors: ['/params/dacId must NOT have fewer than 5 characters'],
};
