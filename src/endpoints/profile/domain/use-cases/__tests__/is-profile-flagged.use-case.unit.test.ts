import 'reflect-metadata';

import * as DaoWorldsCommon from '@alien-worlds/aw-contract-dao-worlds';

import { Container, Failure, Result } from '@alien-worlds/aw-core';

import { FlagRepository } from '../../repositories/flag.repository';
import { IsProfileFlaggedUseCase } from '../is-profile-flagged.use-case';
import { IsProfileFlaggedUseCaseInput } from '../../../../profile/data/dtos/profile.dto';

let container: Container;
let useCase: IsProfileFlaggedUseCase;
const useCaseInput: IsProfileFlaggedUseCaseInput = {
  dacId: 'string',
  accounts: ['awtesteroo12'],
};
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
      .bind<FlagRepository>(FlagRepository.Token)
      .toConstantValue(flagRepository as any);
    container
      .bind<IsProfileFlaggedUseCase>(IsProfileFlaggedUseCase.Token)
      .to(IsProfileFlaggedUseCase);
  });

  beforeEach(() => {
    useCase = container.get<IsProfileFlaggedUseCase>(
      IsProfileFlaggedUseCase.Token
    );
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(IsProfileFlaggedUseCase.Token).not.toBeNull();
  });

  it('Should return a failure when ...', async () => {
    flagRepository.aggregate.mockResolvedValue(
      Result.withFailure(Failure.fromError('error'))
    );
    const result = await useCase.execute(useCaseInput);
    expect(result.isFailure).toBeTruthy();
  });

  it('should return an array when service returns an object', async () => {
    const content =
      new DaoWorldsCommon.Actions.Mappers.FlagcandprofRawMapper().toEntity({
        cand: 'cand',
        reason: '',
        reporter: '',
        block: true,
        dac_id: 'dacId',
      });
    flagRepository.aggregate.mockResolvedValue(Result.withContent(content));
    const result = await useCase.execute(useCaseInput);
    expect(result.content).toBeInstanceOf(Array);
  });

  it('should return Array', async () => {
    const content = [
      new DaoWorldsCommon.Actions.Mappers.FlagcandprofRawMapper().toEntity({
        cand: 'cand',
        reason: '',
        reporter: '',
        block: true,
        dac_id: 'dacId',
      }),
    ];
    flagRepository.aggregate.mockResolvedValue(Result.withContent(content));
    const result = await useCase.execute(useCaseInput);
    expect(result.content).toBeInstanceOf(Array);
  });
});
