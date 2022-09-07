const config = require('./jest.config.js');

module.exports = {
  ...config,
  collectCoverage: false,
  testEnvironment: 'jest-environment-node',
  testMatch: ['**/tests/api/**/*.api.test.js'],
};
