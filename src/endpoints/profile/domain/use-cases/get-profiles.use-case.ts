import {
	ContractActionRepository,
	DaoWorldsContract,
} from '@alien-worlds/eosdac-api-common';
import { injectable, MongoDB, Result, UseCase } from '@alien-worlds/api-core';
import { GetProfilesUseCaseInput } from '../../data/dtos/profile.dto';
import { inject } from 'inversify';

import { Profile } from '../entities/profile';
import { ProfileQueryModel } from '../models/profile.query-model';

/*imports*/
/**
 * @class
 */
@injectable()
export class GetProfilesUseCase implements UseCase<Profile[]> {
	public static Token = 'GET_PROFILES_USE_CASE';

	constructor(
		/*injections*/
		@inject(ContractActionRepository.Token)
		private actionRepository: ContractActionRepository<
			DaoWorldsContract.Actions.Entities.SetProfile,
			DaoWorldsContract.Actions.Types.StprofileDocument
		>
	) {}

	/**
	 * @async
	 * @returns {Promise<Result<Profile[]>>}
	 */
	public async execute(
		input: GetProfilesUseCaseInput
	): Promise<Result<Profile[]>> {
		const queryModel = ProfileQueryModel.create({
			custContract: input.custContract,
			dacId: input.dacId,
			accounts: input.accounts,
		});

		const actionsRes = await this.actionRepository.aggregate(queryModel);
		if (actionsRes.isFailure) {
			return Result.withFailure(actionsRes.failure);
		}

		const profiles = actionsRes.content.map(action => {
			const data = action.action.data;

			return Profile.fromDto({
				action: action.action,
				profile: data.profile,
				block_num: MongoDB.Long.fromBigInt(action.blockNumber),
			});
		});

		return Result.withContent(profiles);
	}

	/*methods*/
}
