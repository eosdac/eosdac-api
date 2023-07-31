import { VotingHistoryInput } from '../voting-history.input';
import { VotingHistoryQueryBuilder } from '../voting-history.query-builder';

const input: VotingHistoryInput = {
  dacId: 'string',
  voter: 'string',
  limit: 20,
  skip: 0,
  toJSON: () => ({
    dacId: 'string',
    voter: 'string',
    limit: 20,
    skip: 0,
  }),
};

describe('VotingHistoryQueryModel Unit tests', () => {
  it('"VotingHistoryQueryModel.toQueryParams" should create mongodb query model', async () => {
    const { dacId, voter, skip, limit } = input;
    const model = new VotingHistoryQueryBuilder().with({
      dacId,
      voter,
      skip,
      limit,
    });

    expect(model.build()).toEqual({
      filter: {
        'action.account': 'dao.worlds',
        'action.name': 'votecust',
        'action.data.dac_id': input.dacId,
        'action.data.voter': input.voter,
      },
      options: {
        skip: input.skip,
        limit: input.limit,
        sort: { block_num: 1 },
      },
    });
  });

  it('should use max number as limit if not provided', async () => {
    const { dacId, voter, skip } = input;
    const model = new VotingHistoryQueryBuilder().with({
      dacId,
      voter,
      skip,
    });

    expect(model.build()).toEqual({
      filter: {
        'action.account': 'dao.worlds',
        'action.name': 'votecust',
        'action.data.dac_id': input.dacId,
        'action.data.voter': input.voter,
      },
      options: {
        skip: input.skip,
        limit: Number.MAX_VALUE,
        sort: { block_num: 1 },
      },
    });
  });
});
