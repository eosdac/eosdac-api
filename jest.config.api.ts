import { compilerOptions } from './tsconfig.json'
import config from './jest.config';
import { pathsToModuleNameMapper } from 'ts-jest'

module.exports = {
  ...config,
  collectCoverage: false,
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-node',
  testMatch: ['**/tests/api/**/*.api.test.ts'],
  roots: ['<rootDir>'],
  modulePaths: [compilerOptions.baseUrl],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
  testTimeout: 45000,
};
