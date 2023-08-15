import { GetProfileInput } from '../get-profile.input';

const input = {
  query: {
    account: 'string',
  },
  params: {
    dacId: 'string',
  },
};



describe('ProfileInput Unit tests', () => {
  it('"GetProfileInput.create" should create instance', async () => {
    const getProfileInput = GetProfileInput.create(
      input.params.dacId,
      input.query.account
    );

    expect(getProfileInput).toBeInstanceOf(GetProfileInput);
  });

  it('ProfileInput instance should have proper account value', async () => {
    const getProfileInput = GetProfileInput.create(
      input.params.dacId,
      input.query.account
    );

    expect(getProfileInput.accounts).toBeInstanceOf(Array);
    expect(getProfileInput.accounts[0]).toBe(input.query.account);

  });

  it('ProfileInput instance should have proper dacId value', async () => {
    const getProfileInput = GetProfileInput.create(
      input.params.dacId,
      input.query.account
    );

    expect(getProfileInput.dacId).toBe(input.params.dacId);
  });

  it('"GetProfileInput.toJSON" should return JSON', async () => {
    const getProfileInput = GetProfileInput.create(
      input.params.dacId,
      input.query.account
    );

    console.log(getProfileInput.toJSON());

    expect(getProfileInput.toJSON()).toEqual({
      dacId: input.params.dacId,
      accounts: [input.query.account],
    });
  });
});
