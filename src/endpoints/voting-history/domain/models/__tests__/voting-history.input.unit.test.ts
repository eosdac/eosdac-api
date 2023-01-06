import { VotingHistoryInput } from '../voting-history.input';
import { VotingHistoryRequestDto } from '../../../data/dtos/user-voting-history.dto';

/*imports*/

/*mocks*/
const input: VotingHistoryRequestDto = {
	dacId: 'string',
	voter: 'string',
};

describe('VotingHistoryInput Unit tests', () => {
	it('"VotingHistoryInput.fromRequest" should create instance', async () => {
		const fromReq = VotingHistoryInput.fromRequest(input);

		expect(fromReq).toBeInstanceOf(VotingHistoryInput);
	});

	it('VotingHistoryInput instance should have proper voter value', async () => {
		const fromReq = VotingHistoryInput.fromRequest(input);

		expect(fromReq.voter).toBe(input.voter);
	});

	/*unit-tests*/
});
