import { ListProfileActionsQueryBuilder } from '../list-profile-actions.query-builder';

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
    { $sort: { block_number: -1 } },
    {
      $group: {
        _id: '$action.data.cand',
        block_number: { $first: '$block_number' },
        profile: { $first: '$action.data.profile' },
        account: { $first: '$action.data.cand' },
        action: { $first: '$action' },
        receiver_sequence: { $first: '$receiver_sequence' },
        global_sequence: { $first: '$global_sequence' },
      },
    },
    { $sort: { block_number: -1 } },
  ],
  options: {},
};

describe('ProfileQueryModel Unit tests', () => {
  it('"ProfileQueryModel.toQueryParams" should create mongodb query model', async () => {
    const model = new ListProfileActionsQueryBuilder().with({ ...input });

    expect(model.build()).toEqual(queryModel);
  });
});
