import {
	Config,
	DACConfig,
	DocsConfig,
	EOSConfig,
	LoggerConfig,
	MongoConfig,
} from './config.types';

export default class AppConfig implements Config {
	constructor(
		public readonly environment: string = process.env.ENVIRONMENT,
		public readonly host: string = process.env.SERVER_ADDR,
		public readonly port: number = Number(process.env.SERVER_PORT),

		public readonly eos: EOSConfig = {
			chainId: process.env.EOS_CHAIN_ID,
			endpoint: process.env.EOS_ENDPOINT,
			dacDirectoryContract: process.env.EOS_DAC_DIRECTORY_CONTRACT,
			legacyDacs: process.env.EOS_LEGACY_DACS.split(' '),
			dacDirectoryMode: process.env.EOS_DAC_DIRECTORY_MODE,
			dacDirectoryDacId: process.env.EOS_DAC_DIRECTORY_DAC_ID,
		},

		public readonly mongo: MongoConfig = {
			url: process.env.MONGO_URL,
			dbName: process.env.MONGO_DB_NAME,
		},

		public readonly docs: DocsConfig = {
			host: process.env.DOCS_HOST,
			routePrefix: process.env.DOCS_ROUTE_PREFIX,
			exposeRoute: Boolean(process.env.DOCS_EXPOSE_ROUTE),
		},

		public readonly logger: LoggerConfig = {
			level: process.env.LOGGER_LEVEL,
			environment: process.env.LOGGER_ENVIRONMENT,
			datadog: {
				apiKey: process.env.LOGGER_DATADOG_API_KEY,
			},
		},

		public readonly dac: DACConfig = {
			nameCache: new Map(),
		}
	) {}
}
