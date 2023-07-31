import * as IndexWorldsCommon from '@alien-worlds/aw-contract-index-worlds';

import {
  Failure,
  GetTableRowsOptions,
  inject,
  injectable,
  Result,
  SmartContractDataNotFoundError,
  UseCase,
} from '@alien-worlds/aw-core';
import { Dac } from '../entities/dacs';
import { DacMapper } from '@endpoints/dacs/data/mappers/dacs.mapper';
import { GetDacsInput } from '../models/dacs.input';

/**
 * @class
 */
@injectable()
export class GetAllDacsUseCase implements UseCase<Dac[]> {
  public static Token = 'GET_ALL_DACS_USE_CASE';

  constructor(
    @inject(IndexWorldsCommon.Services.IndexWorldsContractService.Token)
    private indexWorldsContractService: IndexWorldsCommon.Services.IndexWorldsContractService
  ) {}

  /**
   * @async
   * @returns {Promise<Result<Dac[]>>}
   */
  public async execute(input: GetDacsInput): Promise<Result<Dac[]>> {
    const options: GetTableRowsOptions = {
      limit: input.limit,
      scope: 'index.worlds',
    };

    if (input.dacId) {
      options.lower_bound = input.dacId;
      options.upper_bound = input.dacId;
    }

    const { content: dacs, failure: fetchDacsFailure } =
      await this.indexWorldsContractService.fetchDacs(options);

    if (fetchDacsFailure) {
      return Result.withFailure(fetchDacsFailure);
    }

    if (dacs.length === 0) {
      return Result.withFailure(
        Failure.fromError(
          new SmartContractDataNotFoundError({
            ...options,
            table: 'dacs',
            bound: input.dacId,
          })
        )
      );
    }

    const dacsRawMapper = new IndexWorldsCommon.Deltas.Mappers.DacsRawMapper();
    const dacContractMapper = new DacMapper();

    const result = dacs.map(dac => {
      return dacContractMapper.toDac(dacsRawMapper.toEntity(dac));
    });

    return Result.withContent(result);
  }
}
