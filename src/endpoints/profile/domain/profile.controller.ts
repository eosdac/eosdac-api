import { Failure, injectable, Result } from '@alien-worlds/api-core';
import { DacDirectory, IndexWorldsContractService } from '@alien-worlds/eosdac-api-common';
import { config } from '@config';
import { inject } from 'inversify';

import { ProfileOutput } from '../data/dtos/profile.dto';
import { Profile } from './entities/profile';
import { ProfileInput } from './models/profile.input';
import { GetProfilesUseCase } from './use-cases/get-profiles.use-case';
import { IsProfileFlaggedUseCase } from './use-cases/is-profile-flagged.use-case';

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
		@inject(IndexWorldsContractService.Token)
		private indexWorldsContractService: IndexWorldsContractService,

		@inject(GetProfilesUseCase.Token)
		private getProfilesUseCase: GetProfilesUseCase,

		@inject(IsProfileFlaggedUseCase.Token)
		private isProfileFlaggedUseCase: IsProfileFlaggedUseCase
	) { }

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
			return Result.withFailure(Failure.withMessage("unable to load dac config"));
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
		})

		profiles.forEach(profile => {
			const { account } = profile;
			let isFlagged = false;

			if (flags && flags.length) {
				const flag = flags.find(flag => flag.account === account);
				if (flag && flag.block) {
					isFlagged = true;
				}
			}

			if (isFlagged) {
				results.push(this.getRedactedCandidateResult(account));
			}
			else {
				results.push(profile);
			}
		});

		return Result.withContent({
			count: profiles.length || 0,
			results,
		});
	}


	private loadDacConfig = async (dacId) => {
		const dac_config_cache = config.dac.nameCache.get(dacId);

		if (dac_config_cache) {
			console.info(`Returning cached dac info`);
			return dac_config_cache;
		} else {
			const result = await this.indexWorldsContractService.fetchDacs({
				scope: config.eos.dacDirectoryContract,
				limit: 1,
				lower_bound: dacId,
				upper_bound: dacId,
			})

			if (!result.isFailure && result.content && result.content.length) {
				const dacConfig = DacDirectory.fromTableRow(result.content[0]);
				config.dac.nameCache.set(dacId, dacConfig)

				return dacConfig
			}

			console.warn(`Could not find dac with ID ${dacId}`);
			return null;
		}
	};

	private getRedactedCandidateResult = (account): Profile => {
		return Profile.createErrorProfile(account, {
			name: 'Redacted Candidate',
			body: `Candidate "${account}" profile has been flagged for supplying inappropriate content.`
		})
	}
}
