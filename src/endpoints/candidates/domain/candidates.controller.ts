import {
	DacDirectory,
	IndexWorldsContractService,
} from '@alien-worlds/eosdac-api-common';
import { Failure, injectable, Result } from '@alien-worlds/api-core';
import { config } from '@config';
import { GetCandidatesInput } from './models/get-candidates.input';
import { GetCandidatesOutput } from './models/get-candidates.output';
import { inject } from 'inversify';
import { ListCandidateProfilesUseCase } from './use-cases/list-candidate-profiles.use-case';
import { LoadDacConfigError } from '@common/api/domain/errors/load-dac-config.error';

/*imports*/

/**
 * @class
 *
 *
 */
@injectable()
export class CandidatesController {
	public static Token = 'CANDIDATES_CONTROLLER';

	constructor(
		/*injections*/
		@inject(IndexWorldsContractService.Token)
		private indexWorldsContractService: IndexWorldsContractService,

		@inject(ListCandidateProfilesUseCase.Token)
		private listCandidateProfilesUseCase: ListCandidateProfilesUseCase
	) {}

	/*methods*/

	/**
	 *
	 * @returns {Promise<Result<GetCandidatesOutput, Error>>}
	 */
	public async list(
		input: GetCandidatesInput
	): Promise<Result<GetCandidatesOutput, Error>> {
		const { dacId, walletId } = input;
		const dacConfig = await this.loadDacConfig(input.dacId);

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

	private loadDacConfig = async dacId => {
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
			});

			if (result.isFailure) {
				console.warn(`Could not find dac with ID ${dacId}`);
				return null;
			}

			const dacConfig = DacDirectory.fromTableRow(result.content[0]);
			config.dac.nameCache.set(dacId, dacConfig);

			return dacConfig;
		}
	};
}
