import * as DaoWorldsCommon from '@alien-worlds/dao-worlds-common';

import { inject, injectable, Result, UseCase } from '@alien-worlds/api-core';
import { CandidateVotingPowerQueryBuilder } from '../models/cand-voting-power.query-builder';
import { MongoDB } from '@alien-worlds/storage-mongodb';
import { UserVote } from '../entities/user-vote';
import { UserVoteMongoMapper } from '@endpoints/voting-history/data/mappers/user-vote.mapper';
import { UserVotingHistoryMongoModel } from '@endpoints/voting-history/data/dtos/user-voting-history.dto';
import { VoteAction } from '../user-voting-history.enums';
import { VotingHistoryInput } from '../models/voting-history.input';
import { VotingHistoryQueryBuilder } from '../models/voting-history.query-model';

/**
 * @class
 */
@injectable()
export class GetUserVotingHistoryUseCase implements UseCase<UserVote[]> {
  public static Token = 'GET_USER_VOTING_HISTORY_USE_CASE';

  constructor(
    @inject(DaoWorldsCommon.Actions.DaoWorldsActionRepository.Token)
    private daoWorldsActionRepository: DaoWorldsCommon.Actions.DaoWorldsActionRepository,

    @inject(DaoWorldsCommon.Deltas.DaoWorldsDeltaRepository.Token)
    private daoWorldsDeltasRepository: DaoWorldsCommon.Deltas.DaoWorldsDeltaRepository
  ) {}

  /**
   * @async
   * @returns {Promise<Result<UserVote[]>>}
   */
  public async execute(input: VotingHistoryInput): Promise<Result<UserVote[]>> {
    let userVotes: UserVote[] = [];

    const { dacId, voter } = input;
    const queryBuilder = new VotingHistoryQueryBuilder().with({
      dacId,
      voter,
      skip: 0,
      limit: Number.MAX_VALUE,
    });

    const actionsRes = await this.daoWorldsActionRepository.find(queryBuilder);
    if (actionsRes.isFailure) {
      return Result.withFailure(actionsRes.failure);
    }

    const userVoteMongoMapper = new UserVoteMongoMapper();

    actionsRes.content.forEach(vote => {
      const actionData = vote.data as DaoWorldsCommon.Actions.Entities.Votecust;

      const userVoteDoc: UserVotingHistoryMongoModel = {
        _id: new MongoDB.ObjectId(vote.id),
        dac_id: actionData.dacId,
        vote_timestamp: vote.blockTimestamp,
        voter: actionData.voter || '',
        candidate: '',
        candidate_vote_power: 0,
        action: VoteAction.Voted,
      };

      if (actionData.newvotes && actionData.newvotes.length > 0) {
        for (const candidate of actionData.newvotes) {
          const userVote = userVoteMongoMapper.toEntity({
            ...userVoteDoc,
            candidate,
          });
          userVotes.push(userVote);
        }
      } else {
        userVotes.push(userVoteMongoMapper.toEntity(userVoteDoc));
      }
    });

    userVotes = userVotes.slice(input.skip, input.skip + input.limit);

    const resultPromises = userVotes.map(async entry => {
      entry.action = this.getVotingAction(
        entry.candidate,
        this.getPreviouslyVotedCandidates(entry, actionsRes.content)
      );

      entry.candidateVotePower = await this.getCandidateVotingPower(
        entry.dacId,
        entry.candidate,
        entry.voteTimestamp
      );

      return entry;
    });

    return Result.withContent(await Promise.all(resultPromises));
  }

  private getPreviouslyVotedCandidates(
    vote: UserVote,
    allMatchingVotes: any
  ): string[] {
    let prevCandidates: string[] = [];

    const index = allMatchingVotes.findIndex(v => {
      return (
        vote.voteTimestamp.getTime() == new Date(v.block_timestamp).getTime()
      );
    });

    if (index > 0) {
      prevCandidates = allMatchingVotes[index - 1].action.data.newvotes;
    }

    return prevCandidates;
  }

  private getVotingAction(
    newCandidate: string,
    prevVotedCandidates: string[]
  ): VoteAction {
    let action: VoteAction;

    if (prevVotedCandidates.includes(newCandidate)) {
      action = VoteAction.Refreshed;
    } else {
      action = VoteAction.Voted;
    }

    return action;
  }

  private async getCandidateVotingPower(
    dacId: string,
    candidateName: string,
    block_timestamp: Date
  ): Promise<number> {
    const res = await this.daoWorldsDeltasRepository.find(
      new CandidateVotingPowerQueryBuilder().with({
        dacId,
        candidateName,
        block_timestamp,
      })
    );

    if (res.isFailure) {
      throw res.failure.error;
    }

    return (
      (res.content[0].data as DaoWorldsCommon.Deltas.Entities.Candidates)
        .totalVotePower || 0
    );
  }
}
