import {
	DacDirectory,
	IndexWorldsContract,
} from '@alien-worlds/eosdac-api-common';
import { Failure, injectable, Result } from '@alien-worlds/api-core';
import { config } from '@config';
import { GetCustodiansInput } from './models/get-custodians.input';
import { GetCustodiansOutput } from './models/get-custodians.output';
import { inject } from 'inversify';
import { ListCustodianProfilesUseCase } from './use-cases/list-custodian-profiles.use-case';
import { LoadDacConfigError } from '@common/api/domain/errors/load-dac-config.error';

/*imports*/

/**
 * @class
 *
 *
 */
@injectable()
export class CustodiansController {
	public static Token = 'CUSTODIANS_CONTROLLER';

	constructor(
		/*injections*/
		@inject(IndexWorldsContract.Services.IndexWorldsContractService.Token)
		private indexWorldsContractService: IndexWorldsContract.Services.IndexWorldsContractService,

		@inject(ListCustodianProfilesUseCase.Token)
		private listCustodianProfilesUseCase: ListCustodianProfilesUseCase
	) {}

	/*methods*/

	/**
	 *
	 * @returns {Promise<Result<GetCustodiansOutput, Error>>}
	 */
	public async list(
		input: GetCustodiansInput
	): Promise<Result<GetCustodiansOutput, Error>> {
		const { dacId } = input;
		const dacConfig = await this.loadDacConfig(input.dacId);

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

			if (result.isFailure) {
				console.warn(`Could not find dac with ID ${dacId}`);
				return null;
			}

			const dacConfig = DacDirectory.fromStruct(result.content[0]);
			config.dac.nameCache.set(dacId, dacConfig);

			return dacConfig;
		}
	};
}
