/* eslint-disable @typescript-eslint/no-var-requires */
import { existsSync, statSync } from 'fs';
import ApiConfig from './api-config';

const envPath = process.env.ENVIRONMENT
  ? `./.env-${process.env.ENVIRONMENT}`
  : `./.env`;

if (!existsSync(envPath)) {
  throw new Error(
    `Configuration file not found. Please check path: ${envPath}`
  );
}

const envStats = statSync(envPath);

if (!envStats.isFile()) {
  throw new Error(
    `The given path is not a file. Please check path: ${envPath}`
  );
}

export const config = ApiConfig.create(envPath, '../../package.json');
export { Config } from './config.types';
