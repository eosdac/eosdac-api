import { inject, injectable, Result, UseCase } from '@alien-worlds/aw-core';
import { Profile } from '../entities/profile';
import { GetProfileFlagsUseCase } from './get-profile-flags.use-case';

/**
 * @class
 */
@injectable()
export class FilterFlaggedProfilesUseCase implements UseCase<Profile[]> {
  public static Token = 'FILTER_FLAGGED_PROFILES_USE_CASE';

  constructor(
    @inject(GetProfileFlagsUseCase.Token)
    private getProfileFlagsUseCase: GetProfileFlagsUseCase
  ) {}

  /**
   * @async
   * @returns {Promise<Result<Profile[]>>}
   */
  public async execute(
    dacId: string,
    accounts: string[],
    profiles: Profile[]
  ): Promise<Result<Profile[]>> {
    const list = [];
    const { content: flags, failure } =
      await this.getProfileFlagsUseCase.execute(dacId, accounts);

    if (failure) {
      return Result.withFailure(failure);
    }

    profiles.forEach(profile => {
      let isFlagged = false;
      if (flags && flags.length) {
        const flag = flags.find(flag => flag.cand === profile.account);
        if (flag && flag.block) {
          isFlagged = true;
        }
      }
      if (isFlagged) {
        list.push(
          Profile.createErrorProfile(profile.account, {
            name: 'Redacted Candidate',
            body: `Candidate "${profile.account}" profile has been flagged for supplying inappropriate content.`,
          })
        );
      } else {
        list.push(profile);
      }
    });

    return Result.withContent(list);
  }
}
