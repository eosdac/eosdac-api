import { Container, Failure, Result } from '@alien-worlds/api-core';
import * as IndexWorldsCommon from '@alien-worlds/index-worlds-common';
import { LoadDacConfigError } from '@common/api/domain/errors/load-dac-config.error';
import { config } from '@config';

import { CandidatesController } from '../candidates.controller';
import { GetCandidatesInput } from '../models/get-candidates.input';
import { ListCandidateProfilesUseCase } from '../use-cases/list-candidate-profiles.use-case';

import 'reflect-metadata';

/*mocks*/

('@config');

const mockedConfig = config as jest.Mocked<typeof config>;

let container: Container;
let controller: CandidatesController;
const indexWorldsContractService = {
  fetchDacs: jest.fn(),
};
const listCandidateProfilesUseCase = {
  execute: jest.fn(),
};
const input: GetCandidatesInput = {
  walletId: 'string',
  dacId: 'string',
};

describe('Candidate Controller Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    /*bindings*/
    container
      .bind<IndexWorldsCommon.Services.IndexWorldsContractService>(
        IndexWorldsCommon.Services.IndexWorldsContractService.Token
      )
      .toConstantValue(indexWorldsContractService as any);
    container
      .bind<ListCandidateProfilesUseCase>(ListCandidateProfilesUseCase.Token)
      .toConstantValue(listCandidateProfilesUseCase as any);
    container
      .bind<CandidatesController>(CandidatesController.Token)
      .to(CandidatesController);
  });

  beforeEach(() => {
    controller = container.get<CandidatesController>(
      CandidatesController.Token
    );
    indexWorldsContractService.fetchDacs.mockResolvedValue(
      Result.withContent([
        <IndexWorldsCommon.Deltas.Types.DacsRawModel>{
          accounts: [{ key: 2, value: 'dao.worlds' }],
          sym: {
            symbol: 'EYE',
          },
          refs: [],
        },
      ])
    );
    listCandidateProfilesUseCase.execute.mockResolvedValue(
      Result.withContent([])
    );
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(CandidatesController.Token).not.toBeNull();
  });

  it('Should execute ListCandidateProfilesUseCase', async () => {
    await controller.list(input);
    expect(listCandidateProfilesUseCase.execute).toBeCalled();
  });

  it('Should result with LoadDacConfigError when dac config could not be loaded', async () => {
    mockedConfig.dac.nameCache.get = () => null;
    indexWorldsContractService.fetchDacs.mockResolvedValue(
      Result.withFailure(Failure.withMessage('error'))
    );
    const result = await controller.list(input);
    expect(result.failure.error).toBeInstanceOf(LoadDacConfigError);
  });
});
