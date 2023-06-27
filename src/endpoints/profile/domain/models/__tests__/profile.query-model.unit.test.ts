import { ProfileQueryBuilder } from '../profile.query-builder';

const input = {
  custContract: 'dao.worlds',
  dacId: 'testa',
  accounts: ['awtesteroo12'],
};

const queryModel = {
  pipeline: [
    {
      $match: {
        'action.name': 'stprofile',
        'action.data.dac_id': 'testa',
        'action.data.cand': { $in: ['awtesteroo12'] },
      },
    },
    { $sort: { block_num: -1 } },
    {
      $group: {
        _id: '$action.data.cand',
        block_num: { $first: '$block_num' },
        profile: { $first: '$action.data.profile' },
        account: { $first: '$action.data.cand' },
        action: { $first: '$action' },
        recv_sequence: { $first: '$recv_sequence' },
        global_sequence: { $first: '$global_sequence' },
      },
    },
    { $sort: { block_num: -1 } },
  ],
  options: {},
};

describe('ProfileQueryModel Unit tests', () => {
  it('"ProfileQueryModel.toQueryParams" should create mongodb query model', async () => {
    const model = new ProfileQueryBuilder().with({ ...input });

    expect(model.build()).toEqual(queryModel);
  });
});
