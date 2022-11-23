import 'reflect-metadata';

import { Failure, Result } from '@alien-worlds/api-core';
import { Flag, FlagRepository } from '@alien-worlds/eosdac-api-common';
import { IsProfileFlaggedUseCaseInput, IsProfileFlaggedUseCaseOutput } from 'src/endpoints/profile/data/dtos/profile.dto';

import { Container } from 'inversify';
import { IsProfileFlaggedUseCase } from '../is-profile-flagged.use-case';

/*imports*/
/*mocks*/


let container: Container;
let useCase: IsProfileFlaggedUseCase;
let useCaseInput: IsProfileFlaggedUseCaseInput = {
  dacId: 'string',
  accounts: ['awtesteroo12'],
}
let flagRepository = {
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
    const content = [Flag.create('id', true, '123', 'cand', 'dacId', '', '')]
    flagRepository.aggregate.mockResolvedValue(Result.withContent(content))
    const result = await useCase.execute(useCaseInput);
    expect(result.content).toBeInstanceOf(Array);
  });

  /*unit-tests*/
});

