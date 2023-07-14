import { Container } from '@alien-worlds/api-core';
import { Result } from '@alien-worlds/api-core';
import * as IndexWorldsCommon from '@alien-worlds/index-worlds-common';

import { ProfileInput } from '../models/profile.input';
import { ProfileController } from '../profile.controller';
import { GetProfilesUseCase } from '../use-cases/get-profiles.use-case';
import { IsProfileFlaggedUseCase } from '../use-cases/is-profile-flagged.use-case';

import 'reflect-metadata';

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

    container
      .bind<GetProfilesUseCase>(GetProfilesUseCase.Token)
      .toConstantValue(getProfilesUseCase as any);
    container
      .bind<IsProfileFlaggedUseCase>(IsProfileFlaggedUseCase.Token)
      .toConstantValue(isProfileFlaggedUseCase as any);
    container
      .bind<IndexWorldsCommon.Services.IndexWorldsContractService>(
        IndexWorldsCommon.Services.IndexWorldsContractService.Token
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
        <IndexWorldsCommon.Deltas.Types.DacsRawModel>{
          accounts: [
            // { key: 2, value: 'dao.worlds' }
          ],
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
});
