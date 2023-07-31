import { PackagedDependencyJsonModel } from '@src/config/config.types';

export type HealthCheckJsonModel = {
  status: string;
  version: string;
  timestamp: Date;
  uptimeSeconds: number;
  nodeVersion: string;
  historyApi?: HistoryApiHealthCheckJsonModel;
  dependencies?: PackagedDependencyJsonModel;
  database: DatabaseHealthCheckJsonModel;
  [key: string]: unknown;
};

export type HistoryApiHealthCheckJsonModel = {
  currentBlockNumber: string;
  status: string;
};

export type DatabaseHealthCheckJsonModel = {
  mongodb: string;
  [key: string]: string;
};

export type BlockStateJsonModel = {
  currentBlockNumber: bigint;
};
