import {
  ProfileRequestPathVariables,
  ProfileRequestQueryParams,
} from '../../../data/dtos/profile.dto';

import { GetProfileInput } from '../get-profile.input';
import { Request } from '@alien-worlds/aw-core';

const input = {
  query: {
    account: 'string',
  },
  params: {
    dacId: 'string',
  },
};

describe('ProfileInput Unit tests', () => {
  it('"ProfileInput.fromRequest" should create instance', async () => {
    const fromReq = GetProfileInput.fromRequest(
      input as Request<
        unknown,
        ProfileRequestPathVariables,
        ProfileRequestQueryParams
      >
    );

    expect(fromReq).toBeInstanceOf(GetProfileInput);
  });

  it('ProfileInput instance should have proper account value', async () => {
    const fromReq = GetProfileInput.fromRequest(
      input as Request<
        unknown,
        ProfileRequestPathVariables,
        ProfileRequestQueryParams
      >
    );

    expect(fromReq.accounts).toBeInstanceOf(Array);
    expect(fromReq.accounts[0]).toBe(input.query.account);
  });

  it('ProfileInput instance should have proper dacId value', async () => {
    const fromReq = GetProfileInput.fromRequest(
      input as Request<
        unknown,
        ProfileRequestPathVariables,
        ProfileRequestQueryParams
      >
    );

    expect(fromReq.dacId).toBe(input.params.dacId);
  });
});
