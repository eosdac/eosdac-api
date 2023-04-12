import {
  Failure,
  GetTableRowsOptions,
  inject,
  injectable,
  Result,
  SmartContractDataNotFoundError,
  UseCase,
} from '@alien-worlds/api-core';
import {
  DacDirectory,
  IndexWorldsContract,
} from '@alien-worlds/dao-api-common';

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
    @inject(IndexWorldsContract.Services.IndexWorldsContractService.Token)
    private indexWorldsContractService: IndexWorldsContract.Services.IndexWorldsContractService
  ) {}

  /**
   * @async
   * @returns {Promise<Result<DacDirectory[]>>}
   */
  public async execute(input: GetDacsInput): Promise<Result<DacDirectory[]>> {
    const options: GetTableRowsOptions = {
      limit: input.limit,
    };

    if (input.dacId) {
      options.lower_bound = input.dacId;
      options.upper_bound = input.dacId;
    }

    const { content: dacs, failure: fetchDacsFailure } =
      await this.indexWorldsContractService.fetchDac(options);

    if (fetchDacsFailure) {
      return Result.withFailure(fetchDacsFailure);
    }

    if (dacs.length === 0) {
      return Result.withFailure(
        Failure.fromError(
          new SmartContractDataNotFoundError({
            ...options,
            bound: input.dacId,
          })
        )
      );
    }

    return Result.withContent(dacs.map(DacDirectory.fromStruct));
  }

  /*methods*/
}
