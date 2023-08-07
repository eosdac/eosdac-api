/* eslint-disable sort-imports */
import * as IndexWorldsCommon from '@alien-worlds/aw-contract-index-worlds';

import { inject, injectable, Result } from '@alien-worlds/aw-core';
import { GetCandidatesInput } from './models/get-candidates.input';
import { GetCandidatesOutput } from './models/get-candidates.output';
import { ListCandidateProfilesUseCase } from './use-cases/list-candidate-profiles.use-case';
import { loadDacConfig } from '@common/utils/dac.utils';
import { LoadDacConfigError } from '@common/api/domain/errors/load-dac-config.error';
import { CandidateProfile } from './entities/candidate-profile';

/**
 * Represents the controller for handling candidate-related operations.
 * @class
 * @implements {CandidatesController}
 */
@injectable()
export class CandidatesController {
  public static Token = 'CANDIDATES_CONTROLLER';

  /**
   * @constructor
   * @param {IndexWorldsCommon.Services.IndexWorldsContractService} indexWorldsContractService - The service used to interact with the IndexWorlds contract.
   * @param {ListCandidateProfilesUseCase} listCandidateProfilesUseCase - The use case for listing candidate profiles.
   */
  constructor(
    @inject(IndexWorldsCommon.Services.IndexWorldsContractService.Token)
    private indexWorldsContractService: IndexWorldsCommon.Services.IndexWorldsContractService,
    @inject(ListCandidateProfilesUseCase.Token)
    private listCandidateProfilesUseCase: ListCandidateProfilesUseCase
  ) {}

  /**
   * Lists the candidate profiles for a specific DAC.
   *
   * @async
   * @public
   * @param {GetCandidatesInput} input - The input containing the DAC ID.
   * @returns {Promise<GetCandidatesOutput>} - The output containing the candidate profiles.
   */
  public async list(input: GetCandidatesInput): Promise<GetCandidatesOutput> {
    const { dacId } = input;
    const { content: dacConfig } = await loadDacConfig(
      this.indexWorldsContractService,
      input.dacId
    );
    let result: Result<CandidateProfile[]>;

    if (!dacConfig) {
      result = Result.withFailure(new LoadDacConfigError());
    } else {
      result = await this.listCandidateProfilesUseCase.execute(
        dacId,
        dacConfig
      );
    }

    return GetCandidatesOutput.create(result);
  }
}
