import { ContractAction, injectable, Result, UseCase } from '@alien-worlds/api-core';
import { ContractActionRepository, DaoWorldsContract } from '@alien-worlds/eosdac-api-common';
import { GetProfilesUseCaseInput } from '../../data/dtos/profile.dto';
import { inject } from 'inversify';
import { ProfileQueryModel } from '../models/profile.query-model';

/*imports*/
/**
 * @class
 */
@injectable()
export class GetProfilesUseCase implements UseCase<
	ContractAction<
		DaoWorldsContract.Actions.Entities.SetProfile,
		DaoWorldsContract.Actions.Types.StprofileDocument
	>[]> {
	public static Token = 'GET_PROFILES_USE_CASE';

	constructor(
		/*injections*/
		@inject(ContractActionRepository.Token)
		private contractActionRepository: ContractActionRepository<
			DaoWorldsContract.Actions.Entities.SetProfile,
			DaoWorldsContract.Actions.Types.StprofileDocument
		>
	) { }

	/**
	 * @async
	 * @returns {Promise<Result<Profile[]>>}
	 */
	public async execute(
		input: GetProfilesUseCaseInput
	): Promise<Result<ContractAction<
		DaoWorldsContract.Actions.Entities.SetProfile,
		DaoWorldsContract.Actions.Types.StprofileDocument
	>[]>> {
		const queryModel = ProfileQueryModel.create({
			custContract: input.custContract,
			dacId: input.dacId,
			accounts: input.accounts,
		});

		const actionsRes = await this.contractActionRepository.aggregate(queryModel);
		if (actionsRes.isFailure) {
			return Result.withFailure(actionsRes.failure);
		}

		return Result.withContent(actionsRes.content);
	}

	/*methods*/
}
