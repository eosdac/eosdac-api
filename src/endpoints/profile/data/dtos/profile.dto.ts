export type ProfileRequestQueryParams = {
  account: string;
};

export type ProfileRequestPathVariables = {
  dacId: string;
};

export type ActionDataProfile = {
  profile: string;
  cand: string;
};

export type ProfileItemDocument = {
  description: string;
  email: string;
  familyName: string;
  gender: string;
  givenName: string;
  image: string;
  timezone: string;
  url: string;
};

export type GetProfilesUseCaseInput = {
  custContract: string;
  dacId: string;
  accounts: string[];
};

export type IsProfileFlaggedUseCaseOutput = {
  account: string;
  block: boolean;
};

export type ProfileError = {
  name: string;
  body: string;
};
