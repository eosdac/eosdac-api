import * as IndexWorldsCommon from '@alien-worlds/aw-contract-index-worlds';

import { Failure, inject, injectable, Result } from '@alien-worlds/aw-core';
import { GetCandidatesInput } from './models/get-candidates.input';
import { GetCandidatesOutput } from './models/get-candidates.output';
import { ListCandidateProfilesUseCase } from './use-cases/list-candidate-profiles.use-case';
import { loadDacConfig } from '@common/utils/dac.utils';
import { LoadDacConfigError } from '@common/api/domain/errors/load-dac-config.error';

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
   * @returns {Promise<Result<GetCandidatesOutput, Error>>}
   */
  public async list(
    input: GetCandidatesInput
  ): Promise<Result<GetCandidatesOutput, Error>> {
    const { dacId, walletId } = input;

    const dacConfig = await loadDacConfig(
      this.indexWorldsContractService,
      input.dacId
    );

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
}
