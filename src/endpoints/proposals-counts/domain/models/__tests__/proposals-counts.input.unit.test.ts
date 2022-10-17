import { ProposalsCountsInput } from '../proposals-counts.input';
/*imports*/
/*mocks*/
const input = {
	account: 'string',
};

describe('ProposalsCountsInput Unit tests', () => {
	it('"ProposalsCountsInput.fromRequest" should create instance', async () => {
		const fromReq = ProposalsCountsInput.fromRequest(input);

		expect(fromReq).toBeInstanceOf(ProposalsCountsInput);
	});

	it('ProposalsCountsInput instance should have proper account value', async () => {
		const fromReq = ProposalsCountsInput.fromRequest(input);

		expect(fromReq.account).toBe(input.account);
	});

	/*unit-tests*/
});
