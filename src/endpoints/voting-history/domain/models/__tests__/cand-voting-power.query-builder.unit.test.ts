import {
  CandidateVotingPowerQueryArgs,
  CandidateVotingPowerQueryBuilder,
} from '../cand-voting-power.query-builder';

const input: CandidateVotingPowerQueryArgs = {
  dacId: 'testa',
  candidateName: 'awtesteroo12',
  block_timestamp: new Date(),
};

const queryModel = {
  filter: {
    code: 'dao.worlds',
    scope: input.dacId,
    table: 'candidates',
    'data.candidate_name': input.candidateName,
    block_timestamp: {
      $lt: input.block_timestamp,
    },
  },
  options: {
    sort: { block_timestamp: -1 },
  },
};

describe('CandidateVotingPowerQueryBuilder Unit tests', () => {
  it('"CandidateVotingPowerQueryBuilder.build" should create mongodb query', async () => {
    const model = new CandidateVotingPowerQueryBuilder().with({ ...input });

    expect(model.build()).toEqual(queryModel);
  });
});
