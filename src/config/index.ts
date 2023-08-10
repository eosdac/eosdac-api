import ApiConfig from './api-config';

const envPath = process.env.ENVIRONMENT
  ? `./.env.${process.env.ENVIRONMENT}`
  : `./.env`;

export const config = ApiConfig.create(
  envPath,
  `${process.cwd()}/package.json`
);
export { Config } from './config.types';
