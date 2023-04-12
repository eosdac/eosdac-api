import 'reflect-metadata';

import { Container, Failure, Result } from '@alien-worlds/api-core';
import { CandidatesController } from '../candidates.controller';
import { config } from '@config';
import { GetCandidatesInput } from '../models/get-candidates.input';
import { IndexWorldsContract } from '@alien-worlds/dao-api-common';
import { ListCandidateProfilesUseCase } from '../use-cases/list-candidate-profiles.use-case';
import { LoadDacConfigError } from '@common/api/domain/errors/load-dac-config.error';

/*imports*/

/*mocks*/

jest.mock('@config');

const mockedConfig = config as jest.Mocked<typeof config>;

let container: Container;
let controller: CandidatesController;
const indexWorldsContractService = {
  fetchDac: jest.fn(),
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
      .bind<IndexWorldsContract.Services.IndexWorldsContractService>(
        IndexWorldsContract.Services.IndexWorldsContractService.Token
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
    indexWorldsContractService.fetchDac.mockResolvedValue(
      Result.withFailure(Failure.withMessage('error'))
    );
    const result = await controller.list(input);
    expect(result.failure.error).toBeInstanceOf(LoadDacConfigError);
  });
  /*unit-tests*/
});
