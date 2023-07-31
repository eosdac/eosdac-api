import { GetProfileInput } from '../get-profile.input';

const input = {
  query: {
    account: 'string',
  },
  params: {
    dacId: 'string',
  },
};

const fromReq = GetProfileInput.create(input.params.dacId, input.query.account);

describe('ProfileInput Unit tests', () => {
  it('"ProfileInput.fromRequest" should create instance', async () => {
    expect(fromReq).toBeInstanceOf(GetProfileInput);
  });

  it('ProfileInput instance should have proper account value', async () => {
    expect(fromReq.accounts).toBeInstanceOf(Array);
    expect(fromReq.accounts[0]).toBe(input.query.account);
  });

  it('ProfileInput instance should have proper dacId value', async () => {
    expect(fromReq.dacId).toBe(input.params.dacId);
  });
});
