import * as IndexWorldsCommon from '@alien-worlds/aw-contract-index-worlds';

import { Failure, inject, injectable, Result } from '@alien-worlds/aw-core';
import { GetCustodiansInput } from './models/get-custodians.input';
import { GetCustodiansOutput } from './models/get-custodians.output';
import { ListCustodianProfilesUseCase } from './use-cases/list-custodian-profiles.use-case';
import { loadDacConfig } from '@common/utils/dac.utils';
import { LoadDacConfigError } from '@common/api/domain/errors/load-dac-config.error';

/**
 * @class
 */
@injectable()
export class CustodiansController {
  public static Token = 'CUSTODIANS_CONTROLLER';

  constructor(
    @inject(IndexWorldsCommon.Services.IndexWorldsContractService.Token)
    private indexWorldsContractService: IndexWorldsCommon.Services.IndexWorldsContractService,

    @inject(ListCustodianProfilesUseCase.Token)
    private listCustodianProfilesUseCase: ListCustodianProfilesUseCase
  ) {}

  /**
   *
   * @returns {Promise<Result<GetCustodiansOutput, Error>>}
   */
  public async list(
    input: GetCustodiansInput
  ): Promise<Result<GetCustodiansOutput, Error>> {
    const { dacId } = input;

    const dacConfig = await loadDacConfig(
      this.indexWorldsContractService,
      input.dacId
    );

    if (!dacConfig) {
      return Result.withFailure(Failure.fromError(new LoadDacConfigError()));
    }

    const { content: profiles, failure } =
      await this.listCustodianProfilesUseCase.execute(dacId, dacConfig);

    if (failure) {
      return Result.withFailure(failure);
    }

    return Result.withContent(GetCustodiansOutput.create(profiles));
  }
}
