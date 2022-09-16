import config from './jest.config';

module.exports = {
  ...config,
  collectCoverage: false,
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-node',
  testMatch: ['**/tests/api/**/*.api.test.ts'],
};
