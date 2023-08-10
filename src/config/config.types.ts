import * as envalid from 'envalid';

import { Dac } from '@endpoints/dacs/domain/entities/dacs';
import { MongoConfig } from '@alien-worlds/aw-storage-mongodb';

export type PackagedDependencyJsonModel = {
  [name: string]: string;
};

export const EnvironmentSchema = {
  ENVIRONMENT: envalid.str(),
  HOST: envalid.str(),
  PORT: envalid.port({
    desc: 'port for Node server to run',
    example: '8800',
  }),
  VERSION: envalid.str({
    desc: 'API semantic version',
    example: '2.0.0',
  }),

  MONGO_HOSTS: envalid.str(),
  MONGO_PORTS: envalid.str(),
  MONGO_USER: envalid.str(),
  MONGO_PASSWORD: envalid.str(),
  MONGO_DB_NAME: envalid.str(),
  MONGO_SRV: envalid.str({ default: '' }),
  MONGO_SSL: envalid.str({ default: '' }),
  MONGO_REPLICA_SET: envalid.str({ default: '' }),
  MONGO_AUTH_MECHANISM: envalid.str({ default: '' }),
  MONGO_AUTH_SOURCE: envalid.str({ default: '' }),

  ANTELOPE_CHAIN_ID: envalid.str(),
  ANTELOPE_ENDPOINT: envalid.str(),
  ANTELOPE_DAC_DIRECTORY_CONTRACT: envalid.str(),
  ANTELOPE_LEGACY_DACS: envalid.str(),
  ANTELOPE_DAC_DIRECTORY_MODE: envalid.str(),
  ANTELOPE_DAC_DIRECTORY_DAC_ID: envalid.str(),
  HYPERION_URL: envalid.str(),

  DOCS_HOST: envalid.str(),
  DOCS_ROUTE_PREFIX: envalid.str({ default: '/dao/docs' }),
  DOCS_EXPOSE_ROUTE: envalid.bool({ default: true }),

  HISTORY_API_HOST: envalid.str(),
  HISTORY_API_ROUTE_PREFIX: envalid.str(),

  NEW_RELIC_ENABLED: envalid.bool({ default: false }),
  NEW_RELIC_LICENSE_KEY: envalid.str({ default: '' }),
  NEW_RELIC_APP_NAME: envalid.str({ default: '' }),

  LOGGER_LEVEL: envalid.str(),
  LOGGER_ENVIRONMENT: envalid.str(),
  LOGGER_DATADOG_API_KEY: envalid.str({ default: '' }),
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
