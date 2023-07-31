import { GetVotingPowerQueryBuilder } from '../get-voting-power.query-builder';

const voter = 'voter';
const voteTimestamp: Date = new Date('2022-10-20T15:55:46.000Z');

describe('GetVotingPowerQueryModel Unit tests', () => {
  it('"GetVotingPowerQueryModel.toQueryParams" should create mongodb query model', async () => {
    const model = new GetVotingPowerQueryBuilder().with({
      voter,
      voteTimestamp,
    });

    expect(model.build()).toEqual({
      filter: {
        block_timestamp: {
          $lt: voteTimestamp,
        },
        code: 'stkvt.worlds',
        'data.voter': voter,
        table: 'weights',
      },
      options: {
        limit: 1,
        sort: {
          block_timestamp: -1,
        },
      },
    });
  });
});
