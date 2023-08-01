import * as IndexWorldsCommon from '@alien-worlds/aw-contract-index-worlds';

import { config } from '@config';
import { Dac } from '@endpoints/dacs/domain/entities/dacs';
import { DacMapper } from '@endpoints/dacs/data/mappers/dacs.mapper';
import { isEmptyArray } from './dto.utils';
import { Failure, Result } from '@alien-worlds/aw-core';

export const loadDacConfig = async (
  indexWorldsContractService: IndexWorldsCommon.Services.IndexWorldsContractService,
  dacId: string
): Promise<Result<Dac>> => {
  const dac_config_cache = config.dac.nameCache.get(dacId);

  if (dac_config_cache) {
    console.info(`Returning cached dac info`);
    return Result.withContent(dac_config_cache);
  } else {
    const svcResponse = await indexWorldsContractService.fetchDacs({
      scope: config.antelope.dacDirectoryContract,
      limit: 1,
      lower_bound: dacId,
      upper_bound: dacId,
    });

    if (svcResponse.isFailure || isEmptyArray(svcResponse.content)) {
      console.warn(`Could not find dac with ID ${dacId}`);
      return Result.withFailure(
        Failure.withMessage('unable to load dac config')
      );
    }

    const result = new DacMapper().toDac(
      new IndexWorldsCommon.Deltas.Mappers.DacsRawMapper().toEntity(
        svcResponse.content[0]
      )
    );

    config.dac.nameCache.set(dacId, result);

    return Result.withContent(result);
  }
};
