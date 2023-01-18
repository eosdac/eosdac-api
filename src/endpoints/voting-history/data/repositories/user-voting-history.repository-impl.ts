import { Collection, CollectionSource, FindOptions, Mapper, MongoSource, RepositoryImpl, Result } from '@alien-worlds/api-core';
import { UserVotingHistoryDocument, VoteAction } from './../dtos/user-voting-history.dto';

import { UserVote } from '../../domain/entities/user-vote';
import { VotingHistoryQueryModel } from '../../domain/models/voting-history.query-model';

export class UserVotingHistoryRepositoryImpl extends RepositoryImpl<
  UserVote,
  UserVotingHistoryDocument
> {
  private actions: Collection;
  private contractRows: Collection;

  constructor(
    source: CollectionSource<UserVotingHistoryDocument>,
    mapper: Mapper<UserVote, UserVotingHistoryDocument>,
    mongoSource: MongoSource
  ) {
    super(source, mapper);
    this.actions = mongoSource.database.collection('actions');
    this.contractRows = mongoSource.database.collection('contract_rows');
  }

  async find(
    model: VotingHistoryQueryModel
  ): Promise<Result<UserVote[], Error>> {
    let userVotes: UserVote[] = [];

    const { filter, options } = model.toQueryParams();

    const actionsRes = await (await this.actions.find(filter, {
      ...options,
      skip: 0,
      limit: Number.MAX_VALUE,
    })).toArray();

    actionsRes.forEach((vote) => {
      const actionData = vote.action.data;

      const userVoteDoc: UserVotingHistoryDocument = {
        _id: vote._id,
        dac_id: vote.action.account,
        vote_timestamp: vote.block_timestamp,
        voter: actionData.voter || '',
        candidate: '',
        candidate_vote_power: 0,
        action: VoteAction.Voted,
      };

      if (actionData.newvotes && actionData.newvotes.length > 0) {
        for (const candidate of actionData.newvotes) {
          const userVote = UserVote.fromDocument({
            ...userVoteDoc,
            candidate,
          });

          userVotes.push(userVote)
        }
      } else {
        userVotes.push(UserVote.fromDocument(userVoteDoc));
      }
    })

    userVotes = userVotes.slice(options.skip, options.skip + options.limit)

    const resultPromises = userVotes.map(async (entry) => {
      return UserVote.fromDocument({
        ...entry.toDocument(),
        action: this.getVotingAction(entry.candidate, this.getPreviouslyVotedCandidates(entry, actionsRes)),
        candidate_vote_power: await this.getCandidateVotingPower(entry.dacId, entry.candidate, entry.voteTimestamp),
      })
    })

    return Result.withContent(await Promise.all(resultPromises))
  }

  private getPreviouslyVotedCandidates(vote: UserVote, allMatchingVotes: any): string[] {
    let prevCandidates: string[] = [];

    const index = allMatchingVotes.findIndex(v => {
      return vote.voteTimestamp.getTime() == new Date(v.action?.data?.vote_time_stamp).getTime()
    });

    if (index > 0) {
      prevCandidates = allMatchingVotes[index - 1].action.data.newvotes
    }

    return prevCandidates;
  }

  private getVotingAction(newCandidate: string, prevVotedCandidates: string[]): VoteAction {
    let action: VoteAction;

    if (prevVotedCandidates.includes(newCandidate)) {
      action = VoteAction.Refreshed;
    } else {
      action = VoteAction.Voted;
    }

    return action;
  }

  private async getCandidateVotingPower(dacId: string, candidateName: string, block_timestamp: Date): Promise<number> {
    let votingPower = 0;

    const query = {
      code: dacId,
      "table": "candidates",
      "data.candidate_name": candidateName,
      "block_timestamp": {
        $lt: block_timestamp
      }
    }

    const findOptions: FindOptions = {
      sort: { "block_timestamp": -1 },
    }

    const contractRow = await this.contractRows.findOne(query, findOptions)

    if (contractRow?.data?.total_vote_power) {
      votingPower = contractRow.data.total_vote_power;
    }

    return votingPower;
  }
}
