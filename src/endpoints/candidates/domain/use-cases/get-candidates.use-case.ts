import * as DaoWorldsCommon from '@alien-worlds/aw-contract-dao-worlds';
import { inject, injectable, Result, UseCase } from '@alien-worlds/aw-core';

/**
 * Represents a use case for retrieving candidates for a specific DAC.
 * @class
 * @implements {UseCase<DaoWorldsCommon.Deltas.Entities.Candidates[]>}
 */
@injectable()
export class GetCandidatesUseCase
  implements UseCase<DaoWorldsCommon.Deltas.Entities.Candidates[]>
{
  public static Token = 'GET_CANDIDATES_USE_CASE';

  /**
   * @constructor
   * @param {DaoWorldsCommon.Services.DaoWorldsContractService} service - The service used to interact with the DaoWorlds contract.
   */
  constructor(
    @inject(DaoWorldsCommon.Services.DaoWorldsContractService.Token)
    private service: DaoWorldsCommon.Services.DaoWorldsContractService
  ) {}

  /**
   * Executes the GetCandidatesUseCase to retrieve candidates for a specific DAC.
   *
   * @async
   * @public
   * @param {string} dacId - The ID of the DAC to retrieve candidates for.
   * @param {number} [limit=100] - The maximum number of candidates to retrieve (default: 100).
   * @returns {Promise<Result<DaoWorldsCommon.Deltas.Entities.Candidates[]>>} - The result containing the array of candidate objects.
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
