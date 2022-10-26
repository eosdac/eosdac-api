import { ProfileQueryModel } from '../profile.query-model';
/*imports*/
/*mocks*/
const input = {
  custContract: 'dao.worlds',
  dacId: 'testa',
  accounts: ['awtesteroo12']
};

const queryModel = {
  pipeline: [
    {
      '$match': {
        'action.account': 'dao.worlds',
        'action.name': 'stprofile',
        'action.data.dac_id': 'testa',
        'action.data.cand': { '$in': ['awtesteroo12'] }
      }
    },
    { '$sort': { block_num: -1 } },
    {
      '$group': {
        _id: { cand: '$action.data.cand' },
        block_num: { '$first': '$block_num' },
        profile: { '$first': '$action.data.profile' },
        account: { '$first': '$action.data.cand' },
        action: { '$first': '$action' }
      }
    },
    { '$sort': { block_num: -1 } }
  ],
  options: {}
}

describe('ProfileQueryModel Unit tests', () => {
  it('"ProfileQueryModel.toQueryParams" should create mongodb query model', async () => {
    const model = ProfileQueryModel.create(input);

    expect(model.toQueryParams()).toEqual(queryModel);
  });

  /*unit-tests*/
});

