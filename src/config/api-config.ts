import * as dotenv from 'dotenv';
import * as envalid from 'envalid';

/* eslint-disable @typescript-eslint/no-unused-vars */
import { AntelopeConfig, Config, DACConfig, DocsConfig, EnvironmentSchema, HistoryApiConfig, LoggerConfig, NewRelicConfig, PackagedDependencyJsonModel } from './config.types';

import { MongoConfig } from '@alien-worlds/aw-storage-mongodb';
import { readFileSync } from 'fs';

export default class ApiConfig implements Config {
  public static Token = 'API_CONFIG';

  public static create(dotEnvPath: string, packageJsonPath: string): ApiConfig {
    /*
     * Load config file at `dotEnvPath` as env vars.
     * If a particular env var is already set in the environment,
     * it will NOT be overriden by the values in config file
     */
    console.info(`attempt to load config from '${dotEnvPath}'`);
    const dotenvConfig = dotenv.config({ path: dotEnvPath });
    if (dotenvConfig.error) {
      console.error(`could not load config from '${dotEnvPath}' due to error: (${dotenvConfig.error.message})`);
    }

    /*
     * Validate that all necessary config are available as environment variables.
     * Additionally, convert from string to defined data types in EnvironmentSchema
     */

    const environment = envalid.cleanEnv(process.env, EnvironmentSchema);
    console.info('required configuration found in environment...');

    const packageJsonContent = readFileSync(packageJsonPath, 'utf-8');
    const packageJson = packageJsonContent
      ? JSON.parse(packageJsonContent)
      : {};
    const name = packageJson.name || '';
    const dependencies = packageJson.dependencies || {};

    const env = environment.ENVIRONMENT;
    const version = environment.VERSION || packageJson.version;

    const host = environment.HOST;
    const port = Number(environment.PORT);

    const antelope: AntelopeConfig = {
      chainId: environment.ANTELOPE_CHAIN_ID,
      endpoint: environment.ANTELOPE_ENDPOINT,
      dacDirectoryContract: environment.ANTELOPE_DAC_DIRECTORY_CONTRACT,
      legacyDacs: environment.ANTELOPE_LEGACY_DACS.split(' '),
      dacDirectoryMode: environment.ANTELOPE_DAC_DIRECTORY_MODE,
      dacDirectoryDacId: environment.ANTELOPE_DAC_DIRECTORY_DAC_ID,
      hyperionUrl: environment.HYPERION_URL,
    };

    const mongo: MongoConfig = {
      hosts: environment.MONGO_HOSTS.split(/,\s*/),
      ports: environment.MONGO_PORTS.split(/,\s*/),
      database: environment.MONGO_DB_NAME,
      user: environment.MONGO_USER,
      password: environment.MONGO_PASSWORD,
      srv: Boolean(Number(environment.MONGO_SRV)),
      ssl: Boolean(Number(environment.MONGO_SSL)),
      replicaSet: environment.MONGO_REPLICA_SET,
      authMechanism: environment.MONGO_AUTH_MECHANISM,
      authSource: environment.MONGO_AUTH_SOURCE,
    };

    const docs: DocsConfig = {
      host: environment.DOCS_HOST,
      routePrefix: environment.DOCS_ROUTE_PREFIX,
      exposeRoute: environment.DOCS_EXPOSE_ROUTE,
    };

    const logger: LoggerConfig = {
      level: environment.LOGGER_LEVEL,
      environment: environment.LOGGER_ENVIRONMENT,
      datadog: {
        apiKey: environment.LOGGER_DATADOG_API_KEY,
      },
    };

    const dac: DACConfig = {
      nameCache: new Map(),
    };

    const newRelic: NewRelicConfig = {
      newRelicEnabled: environment.NEW_RELIC_ENABLED,
      appName: environment.NEW_RELIC_APP_NAME || `${packageJson.name}-${env}`,
      licenseKey: environment.NEW_RELIC_LICENSE_KEY,
    };

    const historyApi: HistoryApiConfig = {
      host: environment.HISTORY_API_HOST,
      routePrefix: environment.HISTORY_API_ROUTE_PREFIX,
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
    const versionRegex = /^(\d+)(?:\.(\d+))?(?:\.(\d+))?(.*)?$/;
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
