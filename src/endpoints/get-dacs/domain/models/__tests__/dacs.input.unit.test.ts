import { GetDacsInput } from '../dacs.input';
import { GetDacsRequestQueryParams } from '../../../../get-dacs/data/dtos/dacs.dto';
import { Request } from '@alien-worlds/aw-core';

const input = {
  query: {
    dacId: 'nerix',
    limit: 100,
  },
};

describe('GetDacsInput Unit tests', () => {
  it('"GetDacsInput.fromRequest" should create instance', async () => {
    const fromReq = GetDacsInput.fromRequest(
      input as Request<unknown, object, GetDacsRequestQueryParams>
    );

    expect(fromReq).toBeInstanceOf(GetDacsInput);
  });

  it('GetDacsInput instance should have proper dacId value', async () => {
    const fromReq = GetDacsInput.fromRequest(
      input as Request<unknown, object, GetDacsRequestQueryParams>
    );

    expect(fromReq.dacId).toBe(input.query.dacId);
  });

  it('GetDacsInput instance should have proper limit value', async () => {
    const fromReq = GetDacsInput.fromRequest(
      input as Request<unknown, object, GetDacsRequestQueryParams>
    );

    expect(fromReq.limit).toBe(input.query.limit);
  });
});
