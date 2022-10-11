export type Config = {
	host: string;
	port: number;
	mongo: MongoConfig;
	eos: EOSConfig;
	logger: LoggerConfig;
	docs: DocsConfig;
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
