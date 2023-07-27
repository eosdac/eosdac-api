import 'reflect-metadata';

import * as dacUtils from '@common/utils/dac.utils';
import * as IndexWorldsCommon from '@alien-worlds/aw-contract-index-worlds';
import { Container, Failure, Result } from '@alien-worlds/aw-core';

import { CandidatesController } from '../candidates.controller';
import { config } from '@config';
import { DacMapper } from '@endpoints/get-dacs/data/mappers/dacs.mapper';
import { GetCandidatesInput } from '../models/get-candidates.input';
import { ListCandidateProfilesUseCase } from '../use-cases/list-candidate-profiles.use-case';
import { LoadDacConfigError } from '@common/api/domain/errors/load-dac-config.error';

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

jest.spyOn(dacUtils, 'loadDacConfig').mockResolvedValue(
  new DacMapper().toDac(
    new IndexWorldsCommon.Deltas.Mappers.DacsRawMapper().toEntity(<
      IndexWorldsCommon.Deltas.Types.DacsRawModel
    >{
      accounts: [{ key: '2', value: 'dao.worlds' }],
      symbol: {
        sym: 'EYE',
      },
      refs: [],
    })
  )
);

describe('Candidate Controller Unit tests', () => {
  beforeAll(() => {
    container = new Container();

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
    jest.spyOn(dacUtils, 'loadDacConfig').mockResolvedValueOnce(null);

    const result = await controller.list(input);
    expect(result.failure.error).toBeInstanceOf(LoadDacConfigError);
  });

  it('should return failure when ListCandidateProfilesUseCase fails', async () => {
    listCandidateProfilesUseCase.execute.mockResolvedValue(
      Result.withFailure(Failure.withMessage('error'))
    );

    const result = await controller.list(input);

    expect(listCandidateProfilesUseCase.execute).toBeCalled();
    expect(result.isFailure).toBeTruthy();
  });
});
