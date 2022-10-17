import { ProposalsCountsQueryModel } from '../proposals-counts.query-model';
import { WorkerProposalDocument } from '@alien-worlds/eosdac-api-common';
/*imports*/
/*mocks*/
const input = {
	account: 'string',
};

describe('ProposalsCountsQueryModel Unit tests', () => {
	it('"ProposalsCountsQueryModel.toQueryParams" should create mongodb query model', async () => {
		const model = ProposalsCountsQueryModel.create(input);

		expect(model.toQueryParams()).toEqual({
			filter: {
				$or: [
					{ status: 0, approve_voted: { $ne: input.account } },
					{ status: 2, finalize_voted: { $ne: input.account } },
				],
				dac_id: 'eos.dac',
			},
			options: { sort: { block_num: -1 } },
		});
	});

	/*unit-tests*/
});
