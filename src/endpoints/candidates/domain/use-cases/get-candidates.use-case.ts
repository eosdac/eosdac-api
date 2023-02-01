import { Candidate, DaoWorldsContractService } from '@alien-worlds/eosdac-api-common';
import { injectable, Result, UseCase } from '@alien-worlds/api-core';
import { inject } from 'inversify';

/*imports*/
/**
 * @class
 */
@injectable()
export class GetCandidatesUseCase implements UseCase<Candidate[]> {
  public static Token = 'GET_CANDIDATES_USE_CASE';

  constructor(/*injections*/
    @inject(DaoWorldsContractService.Token)
    private service: DaoWorldsContractService
  ) { }

  /**
   * @async
   * @returns {Promise<Result<Candidate[]>>}
   */
  public async execute(dacId: string, limit = 100): Promise<Result<Candidate[]>> {
    const { content: rows, failure } = await this.service.fetchCandidates({ scope: dacId.toLowerCase(), limit });

    if (failure) {
      return Result.withFailure(failure);
    }

    if (rows.length === 0) {
      return Result.withContent([]);
    }

    const candidates = rows.map(row => Candidate.fromTableRow(row))

    return Result.withContent(candidates)
  }

  /*methods*/
}
