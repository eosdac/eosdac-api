import { Failure } from '@alien-worlds/aw-core';
import { VotesModel } from '../../../../candidates-voters-history/data/dtos/candidates-voters-history.dto';
import { CandidatesVotersHistoryOutput } from '../candidates-voters-history.output';

const data: VotesModel = {
  results: [
    {
      voter: 'string',
      votingPower: 1,
      voteTimestamp: new Date('2022-10-20T15:55:46.000Z'),
      candidate: 'string',
      transactionId: 'string',
    },
  ],
  total: 1,
};

describe('CandidatesVotersHistoryOutput Unit tests', () => {
  it('"create" should create instance', async () => {
    const output = CandidatesVotersHistoryOutput.create(
      data.results,
      data.total
    );

    expect(output).toBeInstanceOf(CandidatesVotersHistoryOutput);
  });

  it('"toJson" should return json object', async () => {
    const output = CandidatesVotersHistoryOutput.create(
      data.results,
      data.total
    );

    expect(output.toJSON()).toBeInstanceOf(Object);
  });

  it('"toJson" should return empty json object when failure', async () => {
    const output = CandidatesVotersHistoryOutput.create(
      data.results,
      data.total,
      Failure.withMessage('error')
    );

    expect(output.toJSON()).toEqual({ results: [], total: 0 });
  });
});
