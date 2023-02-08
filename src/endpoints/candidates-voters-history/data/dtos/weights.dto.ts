import { Long } from '@alien-worlds/api-core';

export type VoteWeightDocument = {
  voter?: string;
  weight?: Long;
  weight_quorum?: Long;
  [key: string]: unknown;
};

export type VoteWeightTableRow = {
  voter?: string;
  weight?: number;
  weight_quorum?: number;
  [key: string]: unknown;
};
