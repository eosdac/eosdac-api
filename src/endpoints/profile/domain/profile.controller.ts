import { Services } from '@alien-worlds/aw-contract-index-worlds';
import { inject, injectable } from '@alien-worlds/aw-core';
import { GetProfilesUseCase } from './use-cases/get-profiles.use-case';
import { loadDacConfig } from '@common/utils/dac.utils';
import { GetProfileInput } from './models/get-profile.input';
import { GetProfileOutput } from './models/get-profile.output';
import { FilterFlaggedProfilesUseCase } from './use-cases/filter-flagged-profiles.use-case';

/**
 * @class
 */
@injectable()
export class ProfileController {
  public static Token = 'PROFILE_CONTROLLER';

  constructor(
    @inject(Services.IndexWorldsContractService.Token)
    private indexWorldsContractService: Services.IndexWorldsContractService,

    @inject(GetProfilesUseCase.Token)
    private getProfilesUseCase: GetProfilesUseCase,

    @inject(FilterFlaggedProfilesUseCase.Token)
    private filterFlaggedProfilesUseCase: FilterFlaggedProfilesUseCase
  ) { }

  /**
   *
   * @returns {Promise<GetProfileOutput>}
   */
  public async getProfile(input: GetProfileInput): Promise<GetProfileOutput> {
    const { dacId, accounts } = input;

    const { content: dacConfig, failure: loadDacConfigFailure } =
      await loadDacConfig(this.indexWorldsContractService, input.dacId);

    if (loadDacConfigFailure) {
      return GetProfileOutput.create([], 0, loadDacConfigFailure);
    }

    const { content: profiles, failure: getProfilesFailure } =
      await this.getProfilesUseCase.execute(
        dacConfig.accounts.custodian,
        dacId,
        accounts
      );

    if (getProfilesFailure) {
      return GetProfileOutput.create([], 0, getProfilesFailure);
    }

    const { content: filteredProfiles, failure: filterFailure } =
      await this.filterFlaggedProfilesUseCase.execute(
        dacId,
        accounts,
        profiles
      );

    if (filterFailure) {
      return GetProfileOutput.create([], 0, filterFailure);
    }

    return GetProfileOutput.create(
      filteredProfiles,
      filteredProfiles.length,
      getProfilesFailure
    );
  }
}
