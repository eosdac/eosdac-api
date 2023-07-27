import * as IndexWorldsCommon from '@alien-worlds/aw-contract-index-worlds';

import {
  EntityNotFoundError,
  Failure,
  inject,
  injectable,
  Result,
} from '@alien-worlds/aw-core';
import { GetProfilesUseCase } from './use-cases/get-profiles.use-case';
import { IsProfileFlaggedUseCase } from './use-cases/is-profile-flagged.use-case';
import { loadDacConfig } from '@common/utils/dac.utils';
import { Profile } from './entities/profile';
import { ProfileInput } from './models/profile.input';
import { ProfileMongoMapper } from '../data/mappers/profile.mapper';
import { ProfileOutput } from '../data/dtos/profile.dto';

/**
 * @class
 */
@injectable()
export class ProfileController {
  public static Token = 'PROFILE_CONTROLLER';

  constructor(
    @inject(IndexWorldsCommon.Services.IndexWorldsContractService.Token)
    private indexWorldsContractService: IndexWorldsCommon.Services.IndexWorldsContractService,

    @inject(GetProfilesUseCase.Token)
    private getProfilesUseCase: GetProfilesUseCase,

    @inject(IsProfileFlaggedUseCase.Token)
    private isProfileFlaggedUseCase: IsProfileFlaggedUseCase
  ) {}

  /**
   *
   * @returns {Promise<Result<ProfileOutput, Error>>}
   */
  public async profile(
    input: ProfileInput
  ): Promise<Result<ProfileOutput, Error>> {
    const results: Profile[] = [];

    const dacConfig = await loadDacConfig(
      this.indexWorldsContractService,
      input.dacId
    );

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

    if (!profiles || profiles.length == 0) {
      return Result.withFailure(
        Failure.fromError(new EntityNotFoundError('dao.worlds_actions'))
      );
    }

    const { content: flags } = await this.isProfileFlaggedUseCase.execute({
      dacId: input.dacId,
      accounts: input.accounts,
    });

    profiles.forEach(profile => {
      const { cand } = profile.data;
      let isFlagged = false;
      if (flags && flags.length) {
        const flag = flags.find(flag => flag.cand === cand);
        if (flag && flag.block) {
          isFlagged = true;
        }
      }
      if (isFlagged) {
        results.push(this.getRedactedCandidateResult(cand));
      } else {
        results.push(ProfileMongoMapper.toEntity(profile));
      }
    });

    return Result.withContent({
      count: profiles.length,
      results,
    });
  }

  private getRedactedCandidateResult = (account): Profile => {
    return Profile.createErrorProfile(account, {
      name: 'Redacted Candidate',
      body: `Candidate "${account}" profile has been flagged for supplying inappropriate content.`,
    });
  };
}
