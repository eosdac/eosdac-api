import 'reflect-metadata';

import { IndexWorldsContract } from '@alien-worlds/eosdac-api-common';

import { Container } from 'inversify';
import { GetProfilesUseCase } from '../use-cases/get-profiles.use-case';
import { IsProfileFlaggedUseCase } from '../use-cases/is-profile-flagged.use-case';
import { ProfileController } from '../profile.controller';
import { ProfileInput } from '../models/profile.input';
import { Result } from '@alien-worlds/api-core';

/*imports*/

/*mocks*/
const getProfilesUseCase = {
	execute: jest.fn(() => Result.withContent([])),
};

const isProfileFlaggedUseCase = {
	execute: jest.fn(() => Result.withContent(1)),
};

let container: Container;
let controller: ProfileController;
const indexWorldsContractService = {
	fetchDac: jest.fn(),
};
const input: ProfileInput = {
	accounts: ['string'],
	dacId: 'string',
};

describe('Profile Controller Unit tests', () => {
	beforeAll(() => {
		container = new Container();
		/*bindings*/
		container
			.bind<GetProfilesUseCase>(GetProfilesUseCase.Token)
			.toConstantValue(getProfilesUseCase as any);
		container
			.bind<IsProfileFlaggedUseCase>(IsProfileFlaggedUseCase.Token)
			.toConstantValue(isProfileFlaggedUseCase as any);
		container
			.bind<IndexWorldsContract.Services.IndexWorldsContractService>(
				IndexWorldsContract.Services.IndexWorldsContractService.Token
			)
			.toConstantValue(indexWorldsContractService as any);
		container
			.bind<ProfileController>(ProfileController.Token)
			.to(ProfileController);
	});

	beforeEach(() => {
		controller = container.get<ProfileController>(ProfileController.Token);
	});

	afterAll(() => {
		jest.clearAllMocks();
		container = null;
	});

	it('"Token" should be set', () => {
		expect(ProfileController.Token).not.toBeNull();
	});

	it('Should execute GetProfilesUseCase', async () => {
		indexWorldsContractService.fetchDac.mockResolvedValue(
			Result.withContent([
				<IndexWorldsContract.Deltas.Types.DacsStruct>{
					accounts: [{ key: 2, value: 'dao.worlds' }],
					symbol: {
						sym: 'EYE',
					},
					refs: [],
				},
			])
		);
		await controller.profile(input);

		expect(getProfilesUseCase.execute).toBeCalled();
	});
	/*unit-tests*/
});
