/* eslint-disable @typescript-eslint/no-explicit-any */
import { VotingHistoryInput } from '../voting-history.input';

describe('VotingHistoryInput Unit tests', () => {
  it('"create" should create instance', async () => {
    const fromReq = VotingHistoryInput.create('dacId', 'voter', 0, 10);

    expect(fromReq).toBeInstanceOf(VotingHistoryInput);
  });
});
