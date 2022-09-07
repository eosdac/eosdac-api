const { createApiTestEnvironment } = require('../environments');
const { HTTP_METHOD, HTTP_STATUS } = require('../common');
const fixtures = require('../fixtures/tokens_owned.fixture');

const environment = createApiTestEnvironment();
environment.initialize();


// meta
const Api = {
  method: HTTP_METHOD.GET,
  url: "/v1/eosdac/my_dacs"
}

const Data = {
  Account: "string"
}


// TODO: write tests for successful response including data

describe('My DACs API Test', () => {
  it('should return status 200', async () => {
    const response = await getApiResponse(Api.method, `${Api.url}?account=${Data.Account}`)

    expect(response.statusCode).toEqual(HTTP_STATUS.OK);
  });

  it('should return empty list when no matching results are available', async () => {
    const response = await getApiResponse(Api.method, `${Api.url}?account=${Data.Account}`)

    expect(JSON.parse(response.body)).toEqual(fixtures.emptyResponse);
  });

  it('should return error if account is not provided', async () => {
    const response = await getApiResponse(Api.method, Api.url)
    const jsonResp = JSON.parse(response.body)

    expect(response.statusCode).toEqual(HTTP_STATUS.BAD_REQUEST);
    expect(jsonResp.message).toEqual("querystring should have required property 'account'")
  });
});


// helpers
const getApiResponse = async function (method, url) {
  return await environment.server.inject({ method, url });
}