import { CandidatesVotersHistoryInput } from '../candidates-voters-history.input';

describe('CandidatesVotersHistoryInput Unit tests', () => {
  it('"toJSON" should return json object', async () => {
    const input = new CandidatesVotersHistoryInput('dacId', 'cand', 20, 10);

    expect(input.toJSON()).toEqual({
      dacId: 'dacId',
      cand: 'cand',
      limit: 10,
      skip: 20,
    });
  });
});
