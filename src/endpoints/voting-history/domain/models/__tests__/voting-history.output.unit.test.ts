import { UserVote } from '../../../domain/entities/user-vote';
import { UserVoteMongoMapper } from '@endpoints/voting-history/data/mappers/user-vote.mapper';
import { VoteAction } from '../../user-voting-history.enums';
import { VotingHistoryOutput } from '../voting-history.output';

const userVotes: UserVote[] = [
  new UserVoteMongoMapper().toEntity({
    dac_id: 'string',
    voter: 'string',
    vote_timestamp: new Date(),
    action: VoteAction.Voted,
    candidate: 'string',
    candidate_vote_power: 0,
  }),
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
});
