import { CandidatesVotersHistoryInput } from '../candidates-voters-history.input';
import { CandidatesVotersHistoryQueryModel } from '../candidates-voters-history.query-model';

/*imports*/
/*mocks*/
const input: CandidatesVotersHistoryInput = {
  dacId: 'string',
  candidateId: 'string',
  limit: 20,
  skip: 0,
};

describe('CandidatesVotersHistoryQueryModel Unit tests', () => {
  it('"CandidatesVotersHistoryQueryModel.toQueryParams" should create mongodb query model', async () => {
    const model = CandidatesVotersHistoryQueryModel.create(input);

    expect(model.toQueryParams()).toEqual({
      pipeline: [
        {
          $match: {
            'action.name': 'votecust',
            'action.data.dac_id': input.dacId,
            'action.data.newvotes': input.candidateId,
          },
        },
        { $sort: { block_num: 1 } },
      ],
      options: {},
    });
  });

  /*unit-tests*/
});
