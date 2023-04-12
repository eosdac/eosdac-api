import { inject, injectable, Result, UseCase } from '@alien-worlds/api-core';
import { DaoWorldsContract } from '@alien-worlds/dao-api-common';

const {
  Entities: { Candidate },
} = DaoWorldsContract.Deltas;

/*imports*/
/**
 * @class
 */
@injectable()
export class GetCandidatesUseCase
  implements UseCase<DaoWorldsContract.Deltas.Entities.Candidate[]>
{
  public static Token = 'GET_CANDIDATES_USE_CASE';

  constructor(
    /*injections*/
    @inject(DaoWorldsContract.Services.DaoWorldsContractService.Token)
    private service: DaoWorldsContract.Services.DaoWorldsContractService
  ) {}

  /**
   * @async
   * @returns {Promise<Result<Candidate[]>>}
   */
  public async execute(
    dacId: string,
    limit = 100
  ): Promise<Result<DaoWorldsContract.Deltas.Entities.Candidate[]>> {
    const { content: rows, failure } = await this.service.fetchCandidate({
      scope: dacId.toLowerCase(),
      code: 'dao.worlds',
      limit,
    });

    if (failure) {
      return Result.withFailure(failure);
    }

    if (rows.length === 0) {
      return Result.withContent([]);
    }

    const filteredRows = rows.filter(row => row.is_active);
    const candidates = filteredRows.map(row => Candidate.fromStruct(row));

    return Result.withContent(candidates);
  }

  /*methods*/
}
