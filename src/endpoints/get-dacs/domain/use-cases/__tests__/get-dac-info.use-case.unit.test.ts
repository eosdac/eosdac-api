import * as DaoWorldsCommon from '@alien-worlds/aw-contract-dao-worlds';
import { Container, Failure, Result } from '@alien-worlds/aw-core';

import { GetDacInfoUseCase } from '../get-dac-info.use-case';
import { Pair } from '@alien-worlds/aw-antelope';

const daoWorldsContractService = {
  fetchDacglobals: jest.fn(),
};

let container: Container;
let useCase: GetDacInfoUseCase;

describe('Get Dac Info Unit tests', () => {
  beforeAll(() => {
    container = new Container();

    container
      .bind<DaoWorldsCommon.Services.DaoWorldsContractService>(
        DaoWorldsCommon.Services.DaoWorldsContractService.Token
      )
      .toConstantValue(daoWorldsContractService as any);
    container
      .bind<GetDacInfoUseCase>(GetDacInfoUseCase.Token)
      .to(GetDacInfoUseCase);
  });

  beforeEach(() => {
    useCase = container.get<GetDacInfoUseCase>(GetDacInfoUseCase.Token);
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(GetDacInfoUseCase.Token).not.toBeNull();
  });

  it('Should return a failure when dao.worlds contract service fails', async () => {
    daoWorldsContractService.fetchDacglobals.mockResolvedValueOnce(
      Result.withFailure(Failure.fromError(null))
    );

    const result = await useCase.execute('');
    expect(result.isFailure).toBeTruthy();
  });

  it('should return an array of DacGlobals', async () => {
    daoWorldsContractService.fetchDacglobals.mockResolvedValue(
      Result.withContent([
        <DaoWorldsCommon.Deltas.Types.DacglobalsRawModel>{
          data: [{ key: 'some_key', value: [] }] as Pair<string, unknown>[],
        },
      ])
    );

    const result = await useCase.execute('');
    expect(result.content).toBeInstanceOf(Array);
    expect(result.content[0]).toBeInstanceOf(
      DaoWorldsCommon.Deltas.Entities.Dacglobals
    );
  });
});
