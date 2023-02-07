import 'reflect-metadata';

import { DaoWorldsContract, FlagRepository } from '@alien-worlds/eosdac-api-common';
import { Failure, Result } from '@alien-worlds/api-core';

import { Container } from 'inversify';
import { IsProfileFlaggedUseCase } from '../is-profile-flagged.use-case';
import { IsProfileFlaggedUseCaseInput } from 'src/endpoints/profile/data/dtos/profile.dto';

/*imports*/
/*mocks*/


let container: Container;
let useCase: IsProfileFlaggedUseCase;
const useCaseInput: IsProfileFlaggedUseCaseInput = {
  dacId: 'string',
  accounts: ['awtesteroo12'],
}
const flagRepository = {
  update: jest.fn(),
  updateMany: jest.fn(),
  add: jest.fn(),
  addOnce: jest.fn(),
  count: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  aggregate: jest.fn(),
  remove: jest.fn(),
  removeMany: jest.fn(),
};

describe('Is Profile Flagged Unit tests', () => {
  beforeAll(() => {
    container = new Container();

    container
      .bind<IsProfileFlaggedUseCase>(IsProfileFlaggedUseCase.Token)
      .to(IsProfileFlaggedUseCase);
    container
      .bind<FlagRepository>(FlagRepository.Token)
      .toConstantValue(flagRepository);
  });

  beforeEach(() => {
    useCase = container.get<IsProfileFlaggedUseCase>(IsProfileFlaggedUseCase.Token);
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(IsProfileFlaggedUseCase.Token).not.toBeNull();
  });

  it('Should return a failure when ...', async () => {
    flagRepository.aggregate.mockResolvedValue(Result.withFailure(Failure.fromError("error")))
    const result = await useCase.execute(useCaseInput);
    expect(result.isFailure).toBeTruthy();
  });

  it('should return Array', async () => {
    const content = [DaoWorldsContract.Actions.Entities.FlagCandidateProfile.fromStruct({
      cand: 'cand',
      dac_id: 'dacId',
      block: true,
    })]
    flagRepository.aggregate.mockResolvedValue(Result.withContent(content))
    const result = await useCase.execute(useCaseInput);
    expect(result.content).toBeInstanceOf(Array);
  });

  /*unit-tests*/
});

