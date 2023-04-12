import {
  DacDirectory,
  IndexWorldsContract,
} from '@alien-worlds/dao-api-common';
import { Failure, inject, injectable, Result } from '@alien-worlds/api-core';
import { config } from '@config';
import { GetProfilesUseCase } from './use-cases/get-profiles.use-case';
import { IsProfileFlaggedUseCase } from './use-cases/is-profile-flagged.use-case';
import { Profile } from './entities/profile';
import { ProfileInput } from './models/profile.input';
import { ProfileOutput } from '../data/dtos/profile.dto';
import { isEmptyArray } from '@common/utils/dto.utils';

/*imports*/

/**
 * @class
 *
 *
 */
@injectable()
export class ProfileController {
  public static Token = 'PROFILE_CONTROLLER';

  constructor(
    /*injections*/
    @inject(IndexWorldsContract.Services.IndexWorldsContractService.Token)
    private indexWorldsContractService: IndexWorldsContract.Services.IndexWorldsContractService,

    @inject(GetProfilesUseCase.Token)
    private getProfilesUseCase: GetProfilesUseCase,

    @inject(IsProfileFlaggedUseCase.Token)
    private isProfileFlaggedUseCase: IsProfileFlaggedUseCase
  ) {}

  /*methods*/

  /**
   *
   * @returns {Promise<Result<ProfileOutput, Error>>}
   */
  public async profile(
    input: ProfileInput
  ): Promise<Result<ProfileOutput, Error>> {
    const results: Profile[] = [];
    const dacConfig = await this.loadDacConfig(input.dacId);
    if (!dacConfig) {
      return Result.withFailure(
        Failure.withMessage('unable to load dac config')
      );
    }
    const custContract = dacConfig.accounts.custodian;

    const { content: profiles, failure: getProfilesFailure } =
      await this.getProfilesUseCase.execute({
        custContract,
        dacId: input.dacId,
        accounts: input.accounts,
      });

    if (getProfilesFailure) {
      return Result.withFailure(getProfilesFailure);
    }

    const { content: flags } = await this.isProfileFlaggedUseCase.execute({
      dacId: input.dacId,
      accounts: input.accounts,
    });

    profiles.forEach(profile => {
      const { candidate } = profile.action.data;
      let isFlagged = false;

      if (flags && flags.length) {
        const flag = flags.find(flag => flag.candidate === candidate);
        if (flag && flag.block) {
          isFlagged = true;
        }
      }

      if (isFlagged) {
        results.push(this.getRedactedCandidateResult(candidate));
      } else {
        results.push(Profile.fromDto(profile.toDocument()));
      }
    });

    return Result.withContent({
      count: profiles.length || 0,
      results,
    });
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

  private getRedactedCandidateResult = (account): Profile => {
    return Profile.createErrorProfile(account, {
      name: 'Redacted Candidate',
      body: `Candidate "${account}" profile has been flagged for supplying inappropriate content.`,
    });
  };
}
