import { UserVote } from '../../entities/user-vote';
import { VoteAction } from '../../../data/dtos/user-voting-history.dto';
import { VotingHistoryOutput } from '../voting-history.output';

/*imports*/
/*mocks*/
const userVotes: UserVote[] = [
	UserVote.fromDocument({
		dac_id: 'string',
		voter: 'string',
		vote_timestamp: new Date(),
		action: VoteAction.Voted,
		candidate: 'string',
		candidate_vote_power: 0,
	})
];

describe('VotingHistoryOutput Unit tests', () => {
	it('"VotingHistoryOutput.create" should create instance', async () => {
		const output = VotingHistoryOutput.create(userVotes);

		expect(output).toBeInstanceOf(VotingHistoryOutput);
	});

	it('VotingHistoryOutput.toJson should return json object', async () => {
		const output = VotingHistoryOutput.create(userVotes);

		expect(output.toJson()).toBeInstanceOf(Object);
	});

	/*unit-tests*/
});
