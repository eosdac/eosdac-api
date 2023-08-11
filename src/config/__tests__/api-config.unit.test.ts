import * as dotenv from 'dotenv';
import * as envalid from 'envalid';
import * as fs from 'fs';

import ApiConfig from '../api-config';

jest.mock('dotenv', () => ({
    config: jest.fn(),
}));

jest.mock('envalid', () => ({
    cleanEnv: jest.fn(),
    str: jest.fn(),
    port: jest.fn(),
    bool: jest.fn(),
}));

jest.mock('fs', () => ({
    readFileSync: jest.fn(),
}));

const initialEnv = {
    ENVIRONMENT: '',
    HOST: '0.0.0.0',
    PORT: '8800',
    VERSION: '2.0.0',
    MONGO_HOSTS: '159.69.65.22',
    MONGO_PORTS: '27019',
    MONGO_DB_NAME: 'alienworlds_dao',
    MONGO_USER: 'alien',
    MONGO_PASSWORD: 'shaiPheoboochi1',
    MONGO_SRV: '',
    MONGO_SSL: '',
    MONGO_REPLICA_SET: '',
    MONGO_AUTH_MECHANISM: '',
    MONGO_AUTH_SOURCE: '',
    ANTELOPE_CHAIN_ID: '8be32650b763690b95b7d7e32d7637757a0a7392ad04f1c393872e525a2ce82b',
    ANTELOPE_ENDPOINT: 'https://wax.eosdac.io',
    ANTELOPE_DAC_DIRECTORY_CONTRACT: 'index.worlds',
    ANTELOPE_LEGACY_DACS: 'nerix',
    ANTELOPE_DAC_DIRECTORY_MODE: 'all',
    ANTELOPE_DAC_DIRECTORY_DAC_ID: '',
    HYPERION_URL: 'https://hyperion-wax-mainnet.wecan.dev',
    LOGGER_LEVEL: 'error',
    LOGGER_ENVIRONMENT: 'local',
    LOGGER_DATADOG_API_KEY: '',
    DOCS_HOST: 'localhost',
    DOCS_ROUTE_PREFIX: '/dao/docs',
    DOCS_EXPOSE_ROUTE: 'true',
    HISTORY_API_HOST: 'http://localhost:8080',
    HISTORY_API_ROUTE_PREFIX: '',
    NEW_RELIC_ENABLED: 'false',
    NEW_RELIC_LICENSE_KEY: '',
    NEW_RELIC_APP_NAME: 'dao-api-example'
}

const packageJsonContent = {
    name: "aw-api-dao",
    version: "1.0.0",
    dependencies: {
        "@alien-worlds/aw-core": "^0.0.15"
    },
}

describe('ApiConfig', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    beforeEach(() => {
        (process as any).env = initialEnv;

        const dotenvConfigMock = { error: null };
        const cleanEnvMock = jest.fn(() => initialEnv);
        const readFileSyncMock = jest.fn(() => JSON.stringify(packageJsonContent));

        (dotenv as any).config.mockReturnValue(dotenvConfigMock);
        (envalid as any).cleanEnv.mockImplementation(cleanEnvMock);
        (fs as any).readFileSync.mockImplementation(readFileSyncMock);
    })

    describe('create', () => {
        it('should create an instance of ApiConfig with valid input', () => {
            const config = ApiConfig.create('./.env', `./package.json`);

            expect(config).toBeInstanceOf(ApiConfig);
        });
    });

    describe('create config when dotenv file cannot be read', () => {
        it('should create an instance of ApiConfig with valid input', () => {
            (dotenv as any).config.mockReturnValueOnce({ error: 'file does not exist' });

            const config = ApiConfig.create('./.env', `./package.json`);

            expect(config).toBeInstanceOf(ApiConfig);
        });
    });

    describe('create config when package json cannot be read', () => {
        it('should create an instance of ApiConfig with valid input', () => {
            (fs as any).readFileSync.mockImplementationOnce(() => null);

            const config = ApiConfig.create('./.env', `./package.json`);

            expect(config).toBeInstanceOf(ApiConfig);
        });
    });

    describe('urlVersion', () => {
        it('should generate the correct URL version when version has all components', () => {
            const version = '1.2.3-alpha';

            const env = {
                ...initialEnv,
                VERSION: version,
            };
            (envalid as any).cleanEnv.mockImplementationOnce(jest.fn(() => env));

            const config = ApiConfig.create('./.env', `./package.json`);

            expect(config.urlVersion).toBe('v1-alpha');
        });

        it('should generate the correct URL version when version is missing components', () => {
            const version = '1.2';

            const env = {
                ...initialEnv,
                VERSION: version,
            };
            (envalid as any).cleanEnv.mockImplementationOnce(jest.fn(() => env));

            const config = ApiConfig.create('./.env', `./package.json`);

            expect(config.urlVersion).toBe('v1');
        });

        it('should generate the correct URL version when version is missing minor and patch components', () => {
            const version = '1';

            const env = {
                ...initialEnv,
                VERSION: version,
            };
            (envalid as any).cleanEnv.mockImplementationOnce(jest.fn(() => env));

            const config = ApiConfig.create('./.env', `./package.json`);

            expect(config.urlVersion).toBe('v1');
        });

        it('should generate the correct URL version when version is not provided', () => {
            const version = '';

            const env = {
                ...initialEnv,
                VERSION: version,
            };
            (envalid as any).cleanEnv.mockImplementationOnce(jest.fn(() => env));

            const config = ApiConfig.create('./.env', `./package.json`);

            expect(config.urlVersion).toBe('v1');
        });
    });
});
