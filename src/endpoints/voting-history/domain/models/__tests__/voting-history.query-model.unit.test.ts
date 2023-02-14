import { VotingHistoryInput } from '../voting-history.input';
import { VotingHistoryQueryModel } from '@alien-worlds/eosdac-api-common';

/*imports*/
/*mocks*/
const input: VotingHistoryInput = {
	dacId: 'string',
	voter: 'string',
	limit: 20,
	skip: 0,
};

describe('VotingHistoryQueryModel Unit tests', () => {
	it('"VotingHistoryQueryModel.toQueryParams" should create mongodb query model', async () => {
		const { dacId, voter, skip, limit } = input;
		const model = VotingHistoryQueryModel.create(dacId, voter, skip, limit);

		expect(model.toQueryParams()).toEqual({
			filter: {
				'action.account': 'dao.worlds',
				'action.name': 'votecust',
				'action.data.dac_id': input.dacId,
				'action.data.voter': input.voter,
			},
			options: {
				skip: input.skip,
				limit: input.limit,
				sort: { block_num: 1 },
			},
		});
	});

	/*unit-tests*/
});
