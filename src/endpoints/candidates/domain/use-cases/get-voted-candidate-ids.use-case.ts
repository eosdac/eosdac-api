import * as DaoWorldsCommon from '@alien-worlds/dao-worlds-common';
import { inject, injectable, Result, UseCase } from '@alien-worlds/api-core';

/**
 * @class
 */
@injectable()
export class GetVotedCandidateIdsUseCase implements UseCase<string[]> {
  public static Token = 'GET_VOTED_CANDIDATE_IDS_USE_CASE';

  constructor(
    @inject(DaoWorldsCommon.Services.DaoWorldsContractService.Token)
    private service: DaoWorldsCommon.Services.DaoWorldsContractService
  ) {}

  /**
   * @async
   * @returns {Promise<Result<string[]>>}
   */
  public async execute(
    dacId: string,
    walletId: string
  ): Promise<Result<string[]>> {
    DaoWorldsCommon.Services.DaoWorldsContractService;

    const { content: rows, failure } = await this.service.fetchVotes({
      scope: dacId.toLowerCase(),
      code: 'dao.worlds',
      limit: 1,
      lower_bound: walletId,
      upper_bound: walletId,
    });

    if (failure) {
      return Result.withFailure(failure);
    }

    const ids = rows[0]?.candidates || [];

    return Result.withContent(ids);
  }
}
