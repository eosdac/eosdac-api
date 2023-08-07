import { Dac } from '@endpoints/dacs/domain/entities/dacs';
import { MongoConfig } from '@alien-worlds/aw-storage-mongodb';

export type PackagedDependencyJsonModel = {
  [name: string]: string;
};

export type Environment = {
  MONGO_HOSTS?: string;
  MONGO_PORTS?: string;
  MONGO_USER?: string;
  MONGO_PASSWORD?: string;
  MONGO_SRV?: number;
  MONGO_SSL?: number;
  MONGO_REPLICA_SET?: string;
  MONGO_AUTH_MECHANISM?: string;
  MONGO_AUTH_SOURCE?: string;
  MONGO_DB_NAME?: string;

  PORT?: string;
  HOST?: string;
  VERSION?: string;

  ANTELOPE_CHAIN_ID?: string;
  ANTELOPE_ENDPOINT?: string;
  ANTELOPE_DAC_DIRECTORY_CONTRACT?: string;
  ANTELOPE_LEGACY_DACS?: string;
  ANTELOPE_DAC_DIRECTORY_MODE?: string;
  ANTELOPE_DAC_DIRECTORY_DAC_ID?: string;
  HYPERION_URL?: string;

  DOCS_HOST?: string;
  DOCS_ROUTE_PREFIX?: string;
  DOCS_EXPOSE_ROUTE?: string;
  LOGGER_LEVEL?: string;
  LOGGER_ENVIRONMENT?: string;
  LOGGER_DATADOG_API_KEY?: string;
  ENVIRONMENT?: string;

  NEW_RELIC_ENABLED?: string;
  NEW_RELIC_LICENSE_KEY?: string;
  NEW_RELIC_APP_NAME?: string;

  HISTORY_API_HOST?: string;
  HISTORY_API_ROUTE_PREFIX?: string;
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
