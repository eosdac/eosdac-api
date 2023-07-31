/* eslint-disable sort-imports */
import * as IndexWorldsCommon from '@alien-worlds/aw-contract-index-worlds';

import { Failure, inject, injectable, Result } from '@alien-worlds/aw-core';
import { GetCandidatesInput } from './models/get-candidates.input';
import { GetCandidatesOutput } from './models/get-candidates.output';
import { ListCandidateProfilesUseCase } from './use-cases/list-candidate-profiles.use-case';
import { loadDacConfig } from '@common/utils/dac.utils';
import { LoadDacConfigError } from '@common/api/domain/errors/load-dac-config.error';
import { CandidateProfile } from './entities/candidate-profile';

/**
 * @class
 *
 *
 */
@injectable()
export class CandidatesController {
  public static Token = 'CANDIDATES_CONTROLLER';

  constructor(
    @inject(IndexWorldsCommon.Services.IndexWorldsContractService.Token)
    private indexWorldsContractService: IndexWorldsCommon.Services.IndexWorldsContractService,

    @inject(ListCandidateProfilesUseCase.Token)
    private listCandidateProfilesUseCase: ListCandidateProfilesUseCase
  ) {}

  /**
   *
   * @returns {Promise<GetCandidatesOutput>}
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
