import { ListProfileFlagsQueryBuilder } from '../list-profile-flags.query-builder';

const input = {
  dacId: 'testa',
  accounts: ['awtesteroo12'],
};

const queryModel = {
  pipeline: [
    { $match: { dac_id: input.dacId, cand: { $in: input.accounts } } },
    { $sort: { block_number: -1 } },
    {
      $group: {
        _id: { cand: '$cand' },
        block: { $first: '$block' },
        cand: { $first: '$cand' },
      },
    },
  ],
  options: {},
};

describe('ListProfileFlagsQueryBuilder Unit tests', () => {
  it('"ListProfileFlagsQueryBuilder.build" should create mongodb query model', async () => {
    const model = new ListProfileFlagsQueryBuilder().with({ ...input });

    expect(model.build()).toEqual(queryModel);
  });
});
