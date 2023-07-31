import {
  IsProfileFlaggedQueryArgs,
  ListProfileFlagsQueryBuilder,
} from '../list-profile-flags.query-builder';

const args: IsProfileFlaggedQueryArgs = {
  dacId: '123',
  accounts: ['account1', 'account2'],
};

const expectedQuery = {
  pipeline: [
    { $match: { dac_id: '123', cand: { $in: ['account1', 'account2'] } } },
    { $sort: { block_num: -1 } },
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

describe('IsProfileFlaggedQueryBuilder', () => {
  it('should build the correct pipeline and options', () => {
    const queryBuilder = new ListProfileFlagsQueryBuilder();

    queryBuilder.with(args);

    const query = queryBuilder.build();

    expect(query).toEqual(expectedQuery);
  });
});
