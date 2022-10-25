import { ProposalsInboxInput } from '../proposals-inbox.input';
import { ProposalsInboxRequestDto } from 'src/endpoints/proposals-inbox/data/dtos/proposals-inbox.dto';

/*imports*/

/*mocks*/
const input: ProposalsInboxRequestDto = {
	account: 'string',
	dacId: 'string',
};

describe('ProposalsInboxInput Unit tests', () => {
	it('"ProposalsInboxInput.fromRequest" should create instance', async () => {
		const fromReq = ProposalsInboxInput.fromRequest(input);

		expect(fromReq).toBeInstanceOf(ProposalsInboxInput);
	});

	it('ProposalsInboxInput instance should have proper account value', async () => {
		const fromReq = ProposalsInboxInput.fromRequest(input);

		expect(fromReq.account).toBe(input.account);
	});

	/*unit-tests*/
});
