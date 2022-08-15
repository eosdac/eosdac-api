const config = require('./jest.config.js');

module.exports = {
  ...config,
  testEnvironment: 'jest-environment-node',
  testMatch: ['**/tests/api/**/*.api.test.js'],
};
