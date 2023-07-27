import * as DaoWorldsCommon from '@alien-worlds/aw-contract-dao-worlds';
import { inject, injectable, Result, UseCase } from '@alien-worlds/aw-core';

/**
 * @class
 */
@injectable()
export class GetCandidatesUseCase
  implements UseCase<DaoWorldsCommon.Deltas.Entities.Candidates[]>
{
  public static Token = 'GET_CANDIDATES_USE_CASE';

  constructor(
    @inject(DaoWorldsCommon.Services.DaoWorldsContractService.Token)
    private service: DaoWorldsCommon.Services.DaoWorldsContractService
  ) {}

  /**
   * @async
   * @returns {Promise<Result<Candidate[]>>}
   */
  public async execute(
    dacId: string,
    limit = 100
  ): Promise<Result<DaoWorldsCommon.Deltas.Entities.Candidates[]>> {
    const { content: rows, failure } = await this.service.fetchCandidates({
      scope: dacId.toLowerCase(),
      limit,
    });

    if (failure) {
      return Result.withFailure(failure);
    }

    if (rows.length === 0) {
      return Result.withContent([]);
    }

    const candidatesRawMapper =
      new DaoWorldsCommon.Deltas.Mappers.CandidatesRawMapper();

    const candidates = rows
      .filter(row => row.is_active)
      .map(candidatesRawMapper.toEntity);

    return Result.withContent(candidates);
  }
}
