import { DacDirectory } from '@alien-worlds/dao-api-common';

export type Config = {
  host: string;
  port: number;
  mongo: MongoConfig;
  eos: EOSConfig;
  logger: LoggerConfig;
  docs: DocsConfig;
  dac: DACConfig;
};

export type MongoConfig = {
  url: string;
  dbName: string;
};

export type EOSConfig = {
  chainId: string;
  endpoint: string;
  dacDirectoryContract: string;
  legacyDacs: string[];
  dacDirectoryMode: string;
  dacDirectoryDacId: string;
};

export type LoggerConfig = {
  level: string;
  environment: string;
  datadog: DataDogConfig;
};

export type DataDogConfig = {
  apiKey: string;
};

export type DocsConfig = {
  host: string;
  routePrefix: string;
  exposeRoute: boolean;
};

export type DACConfig = {
  nameCache: Map<string, DacDirectory>;
};
