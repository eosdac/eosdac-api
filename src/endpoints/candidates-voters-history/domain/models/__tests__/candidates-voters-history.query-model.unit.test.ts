import { CandidatesVotersHistoryInput } from '../candidates-voters-history.input';
import { CandidatesVotersHistoryQueryBuilder } from '../candidates-voters-history.query-model';

const input: CandidatesVotersHistoryInput = {
  dacId: 'string',
  candidateId: 'string',
  limit: 20,
  skip: 0,
};

describe('CandidatesVotersHistoryQueryModel Unit tests', () => {
  it('"CandidatesVotersHistoryQueryModel.toQueryParams" should create mongodb query model', async () => {
    const model = new CandidatesVotersHistoryQueryBuilder().with({ ...input });
    expect(model.build()).toEqual({
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
});
