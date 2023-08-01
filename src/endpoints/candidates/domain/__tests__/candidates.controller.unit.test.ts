import 'reflect-metadata';

import * as dacUtils from '@common/utils/dac.utils';
import * as IndexWorldsCommon from '@alien-worlds/aw-contract-index-worlds';
import { Container, Failure, Result } from '@alien-worlds/aw-core';

import { CandidatesController } from '../candidates.controller';
import { config } from '@config';
import { DacMapper } from '@endpoints/dacs/data/mappers/dacs.mapper';
import { GetCandidatesInput } from '../models/get-candidates.input';
import { ListCandidateProfilesUseCase } from '../use-cases/list-candidate-profiles.use-case';
import { LoadDacConfigError } from '@common/api/domain/errors/load-dac-config.error';

const dac = new DacMapper().toDac(
  new IndexWorldsCommon.Deltas.Mappers.DacsRawMapper().toEntity(<
    IndexWorldsCommon.Deltas.Types.DacsRawModel
  >{
    accounts: [{ key: '2', value: 'dao.worlds' }],
    symbol: {
      sym: 'EYE',
    },
    refs: [],
  })
);

jest.mock('@config', () => {
  return {
    config: {
      dac: {
        nameCache: {
          get: jest.fn(),
        },
      },
    },
  };
});

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
  dacId: 'string',
  toJSON: () => ({ dacId: 'string' }),
};

jest
  .spyOn(dacUtils, 'loadDacConfig')
  .mockResolvedValue(Result.withContent(dac));

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
    jest
      .spyOn(dacUtils, 'loadDacConfig')
      .mockResolvedValueOnce(Result.withFailure('no dac'));

    const output = await controller.list(input);
    expect(output.result.failure.error).toBeInstanceOf(LoadDacConfigError);
  });

  it('should return failure when ListCandidateProfilesUseCase fails', async () => {
    listCandidateProfilesUseCase.execute.mockResolvedValue(
      Result.withFailure(Failure.withMessage('error'))
    );

    const output = await controller.list(input);

    expect(listCandidateProfilesUseCase.execute).toBeCalled();
    expect(output.result.isFailure).toBeTruthy();
  });
});
