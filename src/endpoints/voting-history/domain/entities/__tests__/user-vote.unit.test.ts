import { Long, ObjectId } from '@alien-worlds/api-core';
import { UserVotingHistoryDocument, VoteAction } from '../../../data/dtos/user-voting-history.dto';

import { UserVote } from '../user-vote';

/*imports*/
/*mocks*/

const userVotingHistoryDocument: UserVotingHistoryDocument = {
  _id: new ObjectId('63bc1978dcfe7f921af41272'),
  dac_id: 'string',
  voter: 'string',
  vote_timestamp: new Date("2023-01-12T09:17:00.320Z"),
  action: VoteAction.Voted,
  candidate: 'string',
  candidate_vote_power: 0,
};

describe('UserVote unit tests', () => {
  it('UserVote.fromDocument should return UserVote object based on the provided dto', async () => {
    const userVote = UserVote.fromDocument(userVotingHistoryDocument);

    expect(userVote).toBeInstanceOf(UserVote);
  });

  it('"toDocument" should return a document based on entity', async () => {
    const userVote = UserVote.fromDocument(userVotingHistoryDocument);

    expect(userVote.toDocument()).toBeInstanceOf(Object);

  });

  /*unit-tests*/
});

