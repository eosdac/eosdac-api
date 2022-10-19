import { ProposalsInboxQueryModel } from '../proposals-inbox.query-model';
import { ProposalsInboxRequestDto } from 'src/endpoints/proposals-inbox/data/dtos/proposals-inbox.dto';

/*imports*/
/*mocks*/
const input: ProposalsInboxRequestDto = {
	account: 'string',
	dacId: 'string',
};

describe('ProposalsInboxQueryModel Unit tests', () => {
	it('"ProposalsInboxQueryModel.toQueryParams" should create mongodb query model', async () => {
		const model = ProposalsInboxQueryModel.create(input);

		expect(model.toQueryParams()).toEqual({
			filter: {
				$or: [
					{ status: 0, approve_voted: { $ne: 'string' } },
					{ status: 2, finalize_voted: { $ne: 'string' } },
				],
				dac_id: 'string',
			},
			options: { sort: { block_num: -1 }, skip: 0, limit: 30 },
		});
	});

	/*unit-tests*/
});
