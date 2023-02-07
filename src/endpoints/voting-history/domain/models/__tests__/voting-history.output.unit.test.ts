import { MongoDB } from '@alien-worlds/api-core';
import { UserVote } from '@alien-worlds/eosdac-api-common';
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
		candidate_vote_power: MongoDB.Long.ZERO,
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
