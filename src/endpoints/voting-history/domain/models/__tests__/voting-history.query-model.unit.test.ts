import { VotingHistoryInput } from '../voting-history.input';
import { VotingHistoryQueryModel } from '../voting-history.query-model';

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
		const model = VotingHistoryQueryModel.create(input);

		expect(model.toQueryParams()).toEqual({
			filter: {
				'action.account': input.dacId,
				'action.name': 'votecust',
				'action.data.voter': input.voter
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
