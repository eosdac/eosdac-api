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
    const output: UserVote[] = [];

    const { filter, options } = model.toQueryParams();
    const fetchLastEntryFromPrevPage = options.skip > 0;

    const actionsRes = await (await this.actions.find(filter, options)).toArray();

    /*
     * fetch previous entry to calculate Voting Action 
     * of the first entry in response especially when we do pagination
     */
    let lastEntry;
    if (fetchLastEntryFromPrevPage) {
      lastEntry = await this.actions.findOne(filter, {
        ...options,
        skip: options.skip - 1,
        limit: 1,
      });
    }

    for (let i = 0; i < actionsRes.length; i++) {
      const vote = actionsRes[i];
      const actionData = vote.action.data;

      let prevVotedCandidates: string[] = [];

      /*
       * when doing pagination and calculating Voting Action
       * for the first entry, we want to use the last entry 
       * from previous page. 
       * Otherwise, the previous entry is already available
       * in the actionsRes array.
       */
      if (i == 0 && fetchLastEntryFromPrevPage) {
        prevVotedCandidates = lastEntry.action.data.newvotes;
      } else if (i > 0) {
        prevVotedCandidates = actionsRes[i - 1].action.data.newvotes;
      }

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
        for await (const candidate of actionData.newvotes) {
          const userVote = UserVote.fromDocument({
            ...userVoteDoc,
            candidate,
            action: this.getVotingAction(candidate, prevVotedCandidates),
            candidate_vote_power: await this.getCandidateVotingPower(vote.action.account, candidate, vote.block_timestamp),
          });

          output.push(userVote)
        }
      } else {
        output.push(UserVote.fromDocument(userVoteDoc));
      }
    }

    return Result.withContent(output)
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
