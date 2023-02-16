/* eslint-disable @typescript-eslint/no-var-requires */
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig')

import config from './jest.config';

export default {
  ...config,
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
  collectCoverageFrom: [
    'src/**/*.ts',
    '!**/use-case.ts',
    '!**/route.ts',
    '!**/*.fixture.ts',
    '!**/*.mock.ts',
    '!**/*.error.ts',
    '!**/__tests__/**',
    '!**/__mocks__/**',
    '!**/schemas/**',
    '!src/**/index.ts',
    '!src/**/*.repository.ts',
    '!src/**/*.service.ts',
    '!src/**/*.enums.ts',
    '!src/**/*.dto.ts',
    '!src/**/*.types.ts',
    '!src/**/*.route.ts',
    '!src/**/*.ioc.config.ts',
    '!src/api-handlers/**/*',
  ],
};
