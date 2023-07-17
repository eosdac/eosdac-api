import { CandidatesVotersHistoryInput } from '../candidates-voters-history.input';
import { CandidatesVotersHistoryQueryBuilder } from '../candidates-voters-history.query-builder';

const input: CandidatesVotersHistoryInput = {
  dacId: 'string',
  candidateId: 'string',
  limit: 20,
  skip: 0,
};

describe('CandidatesVotersHistoryQueryBuilder Unit tests', () => {
  it('"CandidatesVotersHistoryQueryBuilder.build" should create mongodb query', async () => {
    const model = new CandidatesVotersHistoryQueryBuilder().with({ ...input });
    expect(model.build()).toEqual({
      pipeline: [
        {
          $match: {
            'action.account': 'dao.worlds',
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
