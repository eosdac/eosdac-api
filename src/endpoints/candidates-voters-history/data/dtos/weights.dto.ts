import { MongoDB } from "@alien-worlds/api-core";

export type VoteWeightDocument = {
  voter?: string;
  weight?: MongoDB.Long;
  weight_quorum?: MongoDB.Long;
  [key: string]: unknown;
};

export type VoteWeightTableRow = {
  voter?: string;
  weight?: number;
  weight_quorum?: number;
  [key: string]: unknown;
};
