const { createApiTestEnvironment } = require('../environments');
const { HTTP_METHOD, HTTP_STATUS } = require('../common');
const { stateSuccessResponse } = require('../fixtures/state.fixture');

const environment = createApiTestEnvironment();
environment.initialize();


// meta
const Api = {
  method: HTTP_METHOD.GET,
  url: "/v1/eosdac/state"
}

describe('State API Test', () => {

  it('should return status 200', async () => {
    const response = await getApiResponse(Api.method, Api.url)

    expect(response.statusCode).toEqual(HTTP_STATUS.OK);
  });

  it('should return current block', async () => {
    const response = await getApiResponse(Api.method, Api.url)

    expect(JSON.parse(response.body)).toEqual(stateSuccessResponse);
  });

});


// helpers
const getApiResponse = async function (method, url) {
  return await environment.server.inject({ method, url });
}
