import {
  DacDirectory,
  IndexWorldsContract,
} from '@alien-worlds/dao-api-common';
import { Failure, inject, injectable, Result } from '@alien-worlds/api-core';
import { config } from '@config';
import { GetCandidatesInput } from './models/get-candidates.input';
import { GetCandidatesOutput } from './models/get-candidates.output';
import { ListCandidateProfilesUseCase } from './use-cases/list-candidate-profiles.use-case';
import { LoadDacConfigError } from '@common/api/domain/errors/load-dac-config.error';
import { isEmptyArray } from '@common/utils/dto.utils';

/*imports*/

/**
 * @class
 *
 *
 */
@injectable()
export class CandidatesController {
  public static Token = 'CANDIDATES_CONTROLLER';

  constructor(
    /*injections*/
    @inject(IndexWorldsContract.Services.IndexWorldsContractService.Token)
    private indexWorldsContractService: IndexWorldsContract.Services.IndexWorldsContractService,

    @inject(ListCandidateProfilesUseCase.Token)
    private listCandidateProfilesUseCase: ListCandidateProfilesUseCase
  ) {}

  /*methods*/

  /**
   *
   * @returns {Promise<Result<GetCandidatesOutput, Error>>}
   */
  public async list(
    input: GetCandidatesInput
  ): Promise<Result<GetCandidatesOutput, Error>> {
    const { dacId, walletId } = input;
    const dacConfig = await this.loadDacConfig(input.dacId);

    if (!dacConfig) {
      return Result.withFailure(Failure.fromError(new LoadDacConfigError()));
    }

    const { content: profiles, failure } =
      await this.listCandidateProfilesUseCase.execute(
        dacId,
        walletId,
        dacConfig
      );

    if (failure) {
      return Result.withFailure(failure);
    }

    return Result.withContent(GetCandidatesOutput.create(profiles));
  }

  private loadDacConfig = async dacId => {
    const dac_config_cache = config.dac.nameCache.get(dacId);

    if (dac_config_cache) {
      console.info(`Returning cached dac info`);
      return dac_config_cache;
    } else {
      const result = await this.indexWorldsContractService.fetchDac({
        scope: config.eos.dacDirectoryContract,
        limit: 1,
        lower_bound: dacId,
        upper_bound: dacId,
      });

      if (result.isFailure || isEmptyArray(result.content)) {
        console.warn(`Could not find dac with ID ${dacId}`);
        return null;
      }

      const dacConfig = DacDirectory.fromStruct(result.content[0]);
      config.dac.nameCache.set(dacId, dacConfig);

      return dacConfig;
    }
  };
}
