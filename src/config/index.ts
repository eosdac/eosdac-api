import ApiConfig from './api-config';

export const config = ApiConfig.create(
  `${process.cwd()}/.env`,
  `${process.cwd()}/package.json`
);
export { Config } from './config.types';
