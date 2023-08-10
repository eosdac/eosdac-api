import * as envalid from 'envalid';

import { Dac } from '@endpoints/dacs/domain/entities/dacs';
import { MongoConfig } from '@alien-worlds/aw-storage-mongodb';

export type PackagedDependencyJsonModel = {
  [name: string]: string;
};

export const EnvironmentSchema = {
  MONGO_HOSTS: envalid.str(),
  MONGO_PORTS: envalid.str(),
  MONGO_USER: envalid.str(),
  MONGO_PASSWORD: envalid.str(),
  MONGO_SRV: envalid.str(),
  MONGO_SSL: envalid.str(),
  MONGO_REPLICA_SET: envalid.str(),
  MONGO_AUTH_MECHANISM: envalid.str(),
  MONGO_AUTH_SOURCE: envalid.str(),
  MONGO_DB_NAME: envalid.str(),

  PORT: envalid.port(),
  HOST: envalid.str(),
  VERSION: envalid.str(),

  ANTELOPE_CHAIN_ID: envalid.str(),
  ANTELOPE_ENDPOINT: envalid.str(),
  ANTELOPE_DAC_DIRECTORY_CONTRACT: envalid.str(),
  ANTELOPE_LEGACY_DACS: envalid.str(),
  ANTELOPE_DAC_DIRECTORY_MODE: envalid.str(),
  ANTELOPE_DAC_DIRECTORY_DAC_ID: envalid.str(),
  HYPERION_URL: envalid.str(),

  DOCS_HOST: envalid.str(),
  DOCS_ROUTE_PREFIX: envalid.str(),
  DOCS_EXPOSE_ROUTE: envalid.str(),
  LOGGER_LEVEL: envalid.str(),
  LOGGER_ENVIRONMENT: envalid.str(),
  LOGGER_DATADOG_API_KEY: envalid.str(),
  ENVIRONMENT: envalid.str(),

  NEW_RELIC_ENABLED: envalid.bool(),
  NEW_RELIC_LICENSE_KEY: envalid.str(),
  NEW_RELIC_APP_NAME: envalid.str(),

  HISTORY_API_HOST: envalid.str(),
  HISTORY_API_ROUTE_PREFIX: envalid.str(),
};

export type Config = {
  host: string;
  port: number;
  mongo: MongoConfig;
  antelope: AntelopeConfig;
  logger: LoggerConfig;
  docs: DocsConfig;
  dac: DACConfig;
  newRelic: NewRelicConfig;
  historyApi: HistoryApiConfig;
};

export type AntelopeConfig = {
  chainId: string;
  endpoint: string;
  dacDirectoryContract: string;
  legacyDacs: string[];
  dacDirectoryMode: string;
  dacDirectoryDacId: string;
  hyperionUrl: string;
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
  nameCache: Map<string, Dac>;
};

export type NewRelicConfig = {
  newRelicEnabled: boolean;
  appName: string;
  licenseKey: string;
};

export type HistoryApiConfig = {
  host: string;
  routePrefix: string;
};



