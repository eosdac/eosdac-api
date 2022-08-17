const { createApiTestEnvironment } = require('../environments');

const environment = createApiTestEnvironment();
environment.initialize();

describe('State API Test', () => {

  it('Should return 200', async () => {
    const response = await environment.server.inject({
      method: 'GET',
      url: '/v1/eosdac/state',
    });

    expect(response.statusCode).toEqual(200);
  });

});
