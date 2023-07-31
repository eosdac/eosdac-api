/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Config,
  DACConfig,
  DocsConfig,
  Environment,
  AntelopeConfig,
  HistoryApiConfig,
  LoggerConfig,
  NewRelicConfig,
  PackagedDependencyJsonModel,
} from './config.types';

import { MongoConfig } from '@alien-worlds/aw-storage-mongodb';
import { readEnvFile } from './config.utils';
import { readFileSync } from 'fs';

export default class ApiConfig implements Config {
  public static Token = 'API_CONFIG';

  public static create(envPath: string, packageJsonPath: string): ApiConfig {
    const environment: Environment = { ...process.env } as Environment;
    const dotEnv = readEnvFile(envPath);
    const packageJsonContent = readFileSync(packageJsonPath, 'utf-8');
    const packageJson = packageJsonContent
      ? JSON.parse(packageJsonContent)
      : {};

    const name = packageJson.name || '';
    const dependencies = packageJson.dependencies || {};
    const version =
      environment.VERSION || dotEnv.VERSION || packageJson.version;
    const env = environment.ENVIRONMENT || dotEnv.ENVIRONMENT;
    const host = environment.HOST || dotEnv.HOST;
    const port = Number(environment.PORT || dotEnv.PORT);
    const antelope: AntelopeConfig = {
      chainId: environment.ANTELOPE_CHAIN_ID || dotEnv.ANTELOPE_CHAIN_ID,
      endpoint: environment.ANTELOPE_ENDPOINT || dotEnv.ANTELOPE_ENDPOINT,
      dacDirectoryContract:
        environment.ANTELOPE_DAC_DIRECTORY_CONTRACT ||
        dotEnv.ANTELOPE_DAC_DIRECTORY_CONTRACT,
      legacyDacs: (
        environment.ANTELOPE_LEGACY_DACS || dotEnv.ANTELOPE_LEGACY_DACS
      ).split(' '),
      dacDirectoryMode:
        environment.ANTELOPE_DAC_DIRECTORY_MODE ||
        dotEnv.ANTELOPE_DAC_DIRECTORY_MODE,
      dacDirectoryDacId:
        environment.ANTELOPE_DAC_DIRECTORY_DAC_ID ||
        dotEnv.ANTELOPE_DAC_DIRECTORY_DAC_ID,
      hyperionUrl: environment.HYPERION_URL || dotEnv.HYPERION_URL,
    };

    const mongo: MongoConfig = {
      hosts: (environment.MONGO_HOSTS || dotEnv.MONGO_HOSTS).split(/,\s*/),
      ports: (environment.MONGO_PORTS || dotEnv.MONGO_PORTS).split(/,\s*/),
      database: environment.MONGO_DB_NAME || dotEnv.MONGO_DB_NAME,
      user: environment.MONGO_USER || dotEnv.MONGO_USER,
      password: environment.MONGO_PASSWORD || dotEnv.MONGO_PASSWORD,
      srv: Boolean(Number(environment.MONGO_SRV || dotEnv.MONGO_SRV)),
      ssl: Boolean(Number(environment.MONGO_SSL || dotEnv.MONGO_SSL)),
      replicaSet: environment.MONGO_REPLICA_SET || dotEnv.MONGO_REPLICA_SET,
      authMechanism:
        environment.MONGO_AUTH_MECHANISM || dotEnv.MONGO_AUTH_MECHANISM,
      authSource: environment.MONGO_AUTH_SOURCE || dotEnv.MONGO_AUTH_SOURCE,
    };
    const docs: DocsConfig = {
      host: environment.DOCS_HOST || dotEnv.DOCS_HOST,
      routePrefix: environment.DOCS_ROUTE_PREFIX || dotEnv.DOCS_ROUTE_PREFIX,
      exposeRoute: Boolean(
        environment.DOCS_EXPOSE_ROUTE || dotEnv.DOCS_EXPOSE_ROUTE
      ),
    };
    const logger: LoggerConfig = {
      level: environment.LOGGER_LEVEL || dotEnv.LOGGER_LEVEL,
      environment: environment.LOGGER_ENVIRONMENT || dotEnv.LOGGER_ENVIRONMENT,
      datadog: {
        apiKey:
          environment.LOGGER_DATADOG_API_KEY || dotEnv.LOGGER_DATADOG_API_KEY,
      },
    };
    const dac: DACConfig = {
      nameCache: new Map(),
    };

    const newRelic: NewRelicConfig = {
      newRelicEnabled: Boolean(
        environment.NEW_RELIC_ENABLED || dotEnv.NEW_RELIC_ENABLED
      ),
      appName:
        environment.NEW_RELIC_APP_NAME ||
        dotEnv.NEW_RELIC_APP_NAME ||
        `${process.env.npm_package_name}-${env}`,
      licenseKey:
        environment.NEW_RELIC_LICENSE_KEY || dotEnv.NEW_RELIC_LICENSE_KEY,
    };

    const historyApi: HistoryApiConfig = {
      host: environment.HISTORY_API_HOST || dotEnv.HISTORY_API_HOST,
      routePrefix:
        environment.HISTORY_API_ROUTE_PREFIX || dotEnv.HISTORY_API_ROUTE_PREFIX,
    };

    return new ApiConfig(
      name,
      version,
      dependencies,
      env,
      host,
      port,
      antelope,
      mongo,
      docs,
      logger,
      dac,
      newRelic,
      historyApi
    );
  }

  private _urlVersion: string;

  private constructor(
    public readonly name: string,
    public readonly version: string,
    public readonly dependencies: PackagedDependencyJsonModel,
    public readonly environment: string,
    public readonly host: string,
    public readonly port: number,
    public readonly antelope: AntelopeConfig,
    public readonly mongo: MongoConfig,
    public readonly docs: DocsConfig,
    public readonly logger: LoggerConfig,
    public readonly dac: DACConfig,
    public readonly newRelic: NewRelicConfig,
    public readonly historyApi: HistoryApiConfig
  ) {
    const versionRegex = /^(\d+)\.(\d+)\.(\d+)(.*)?$/;
    const match = version.match(versionRegex);

    if (match) {
      const [, major, minor, patch, rest] = match;
      this._urlVersion = `v${major || 1}${rest ? `${rest}` : ''}`;
    }
  }

  public get urlVersion() {
    return this._urlVersion;
  }
}
