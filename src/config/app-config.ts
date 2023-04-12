import { MongoConfig } from '@alien-worlds/api-core';
import {
  Config,
  DACConfig,
  DocsConfig,
  EOSConfig,
  Environment,
  LoggerConfig,
} from './config.types';
import { readEnvFile } from './config.utils';

export default class AppConfig implements Config {
  public static create(envPath: string): AppConfig {
    const environment: Environment = { ...process.env } as Environment;
    const dotEnv = readEnvFile(envPath);

    const version = environment.VERSION || dotEnv.VERSION;
    const env = environment.ENVIRONMENT || dotEnv.ENVIRONMENT;
    const host = environment.HOST || dotEnv.HOST;
    const port = Number(environment.PORT || dotEnv.PORT);
    const eos: EOSConfig = {
      chainId: environment.EOS_CHAIN_ID || dotEnv.EOS_CHAIN_ID,
      endpoint: environment.EOS_ENDPOINT || dotEnv.EOS_ENDPOINT,
      dacDirectoryContract:
        environment.EOS_DAC_DIRECTORY_CONTRACT ||
        dotEnv.EOS_DAC_DIRECTORY_CONTRACT,
      legacyDacs: (environment.EOS_LEGACY_DACS || dotEnv.EOS_LEGACY_DACS).split(
        ' '
      ),
      dacDirectoryMode:
        environment.EOS_DAC_DIRECTORY_MODE || dotEnv.EOS_DAC_DIRECTORY_MODE,
      dacDirectoryDacId:
        environment.EOS_DAC_DIRECTORY_DAC_ID || dotEnv.EOS_DAC_DIRECTORY_DAC_ID,
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

    return new AppConfig(version || 'v1', env, host, port, eos, mongo, docs, logger, dac);
  }

  private constructor(
    public readonly version: string,
    public readonly environment: string,
    public readonly host: string,
    public readonly port: number,
    public readonly eos: EOSConfig,
    public readonly mongo: MongoConfig,
    public readonly docs: DocsConfig,
    public readonly logger: LoggerConfig,
    public readonly dac: DACConfig
  ) {}
}
