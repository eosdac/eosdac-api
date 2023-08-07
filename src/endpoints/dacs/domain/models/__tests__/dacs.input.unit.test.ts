import { GetDacsInput } from '../dacs.input';

const input = {
  query: {
    dacId: 'nerix',
    limit: 100,
  },
};

describe('GetDacsInput Unit tests', () => {
  it('"GetDacsInput.fromRequest" should create instance', async () => {
    const fromReq = GetDacsInput.create(input.query.dacId, input.query.limit);

    expect(fromReq).toBeInstanceOf(GetDacsInput);
  });

  it('GetDacsInput instance should have proper dacId value', async () => {
    const fromReq = GetDacsInput.create(input.query.dacId, input.query.limit);

    expect(fromReq.dacId).toBe(input.query.dacId);
  });

  it('GetDacsInput instance should have proper limit value', async () => {
    const fromReq = GetDacsInput.create(input.query.dacId, input.query.limit);

    expect(fromReq.limit).toBe(input.query.limit);
  });
});
