import 'reflect-metadata';

import * as dacUtils from '@common/utils/dac.utils';
import * as IndexWorldsCommon from '@alien-worlds/aw-contract-index-worlds';
import { Container, Result } from '@alien-worlds/aw-core';

import { config } from '@config';
import { CustodiansController } from '../custodians.controller';
import { DacMapper } from '@endpoints/get-dacs/data/mappers/dacs.mapper';
import { GetCustodiansInput } from '../models/get-custodians.input';
import { ListCustodianProfilesUseCase } from '../use-cases/list-custodian-profiles.use-case';
import { LoadDacConfigError } from '@common/api/domain/errors/load-dac-config.error';

('@config');

const mockedConfig = config as jest.Mocked<typeof config>;

let container: Container;
let controller: CustodiansController;
const indexWorldsContractService = {
  fetchDac: jest.fn(),
};
const listCandidateProfilesUseCase = {
  execute: jest.fn(),
};
const input: GetCustodiansInput = {
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

describe('Custodians Controller Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    /*bindings*/
    container
      .bind<IndexWorldsCommon.Services.IndexWorldsContractService>(
        IndexWorldsCommon.Services.IndexWorldsContractService.Token
      )
      .toConstantValue(indexWorldsContractService as any);
    container
      .bind<ListCustodianProfilesUseCase>(ListCustodianProfilesUseCase.Token)
      .toConstantValue(listCandidateProfilesUseCase as any);
    container
      .bind<CustodiansController>(CustodiansController.Token)
      .to(CustodiansController);
  });

  beforeEach(() => {
    controller = container.get<CustodiansController>(
      CustodiansController.Token
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
    expect(CustodiansController.Token).not.toBeNull();
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
});
