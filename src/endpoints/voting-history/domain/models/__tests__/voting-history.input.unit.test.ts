/* eslint-disable @typescript-eslint/no-explicit-any */
import { VotingHistoryInput } from '../voting-history.input';
import { VotingHistoryRequestQueryParams } from '../../../data/dtos/user-voting-history.dto';

/*imports*/

/*mocks*/
const input: VotingHistoryRequestQueryParams = {
  dacId: 'string',
  voter: 'string',
};

describe('VotingHistoryInput Unit tests', () => {
  it('"VotingHistoryInput.fromRequest" should create instance', async () => {
    const fromReq = VotingHistoryInput.fromRequest({ query: input } as any);

    expect(fromReq).toBeInstanceOf(VotingHistoryInput);
  });

  it('VotingHistoryInput instance should have proper voter value', async () => {
    const fromReq = VotingHistoryInput.fromRequest({ query: input } as any);

    expect(fromReq.voter).toBe(input.voter);
  });

  /*unit-tests*/
});
