import * as IndexWorldsCommon from '@alien-worlds/aw-contract-index-worlds';
import { Failure, inject, injectable } from '@alien-worlds/aw-core';
import { GetCustodiansInput } from './models/get-custodians.input';
import { GetCustodiansOutput } from './models/get-custodians.output';
import { ListCustodianProfilesUseCase } from './use-cases/list-custodian-profiles.use-case';
import { loadDacConfig } from '@common/utils/dac.utils';
import { LoadDacConfigError } from '@common/api/domain/errors/load-dac-config.error';

/**
 * Represents the controller for handling custodians.
 * @class
 */
@injectable()
export class CustodiansController {
  public static Token = 'CUSTODIANS_CONTROLLER';

  /**
   * Creates an instance of CustodiansController.
   * @constructor
   * @param {IndexWorldsCommon.Services.IndexWorldsContractService} indexWorldsContractService - The service for the Index Worlds contract.
   * @param {ListCustodianProfilesUseCase} listCustodianProfilesUseCase - The use case for listing custodian profiles.
   */
  constructor(
    @inject(IndexWorldsCommon.Services.IndexWorldsContractService.Token)
    private indexWorldsContractService: IndexWorldsCommon.Services.IndexWorldsContractService,

    @inject(ListCustodianProfilesUseCase.Token)
    private listCustodianProfilesUseCase: ListCustodianProfilesUseCase
  ) {}

  /**
   * Lists custodians along with their profiles for a given DAC ID.
   *
   * @async
   * @public
   * @param {GetCustodiansInput} input - The input data containing the DAC ID.
   * @returns {Promise<GetCustodiansOutput>} - A Promise that resolves to a GetCustodiansOutput containing an array of custodian profiles or a failure object in case of an error.
   */
  public async list(input: GetCustodiansInput): Promise<GetCustodiansOutput> {
    const { dacId } = input;

    const { content: dacConfig } = await loadDacConfig(
      this.indexWorldsContractService,
      input.dacId
    );

    if (!dacConfig) {
      return GetCustodiansOutput.create(
        [],
        Failure.fromError(new LoadDacConfigError())
      );
    }

    const { content: profiles, failure } =
      await this.listCustodianProfilesUseCase.execute(dacId, dacConfig);

    if (failure) {
      return GetCustodiansOutput.create([], failure);
    }

    return GetCustodiansOutput.create(profiles);
  }
}
