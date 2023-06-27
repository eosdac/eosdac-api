import {
  ProfileRequestPathVariables,
  ProfileRequestQueryParams,
} from '../../../data/dtos/profile.dto';

import { ProfileInput } from '../profile.input';
import { Request } from '@alien-worlds/api-core';

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
    const fromReq = ProfileInput.fromRequest(
      input as Request<
        unknown,
        ProfileRequestPathVariables,
        ProfileRequestQueryParams
      >
    );

    expect(fromReq).toBeInstanceOf(ProfileInput);
  });

  it('ProfileInput instance should have proper account value', async () => {
    const fromReq = ProfileInput.fromRequest(
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
    const fromReq = ProfileInput.fromRequest(
      input as Request<
        unknown,
        ProfileRequestPathVariables,
        ProfileRequestQueryParams
      >
    );

    expect(fromReq.dacId).toBe(input.params.dacId);
  });

  
});
