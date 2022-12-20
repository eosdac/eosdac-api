import { inject, injectable, Result, UseCase } from '@alien-worlds/api-core';
import { DacDirectory, IndexWorldsContractService } from '@alien-worlds/eosdac-api-common';

import { GetDacsInput } from '../models/dacs.input';

/*imports*/
/**
 * @class
 */
@injectable()
export class GetAllDacsUseCase implements UseCase<DacDirectory[]> {
  public static Token = 'GET_ALL_DACS_USE_CASE';

  constructor(
    /*injections*/
    @inject(IndexWorldsContractService.Token) private indexWorldsContractService: IndexWorldsContractService
  ) { }

  /**
   * @async
   * @returns {Promise<Result<DacDirectory[]>>}
   */
  public async execute(input: GetDacsInput): Promise<Result<DacDirectory[]>> {
    const { content: dacs, failure: fetchDacsFailure } =
      await this.indexWorldsContractService.fetchDacs({
        scope: input.scope,
        limit: input.limit,
      })

    if (fetchDacsFailure) {
      return Result.withFailure(fetchDacsFailure);
    }

    return Result.withContent(dacs.map(DacDirectory.fromTableRow))
  }

  /*methods*/
}

