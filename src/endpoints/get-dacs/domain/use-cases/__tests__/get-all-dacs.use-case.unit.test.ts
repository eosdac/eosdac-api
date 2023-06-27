import { Container, Failure, Result } from '@alien-worlds/api-core';
import * as IndexWorldsCommon from '@alien-worlds/index-worlds-common';

import { GetDacsInput } from '../../models/dacs.input';
import { GetAllDacsUseCase } from '../get-all-dacs.use-case';

import 'reflect-metadata';

/*mocks*/

const indexWorldsContractService = {
  fetchDacs: jest.fn(),
};

const input: GetDacsInput = {
  dacId: 'string',
  limit: 1,
};

let container: Container;
let useCase: GetAllDacsUseCase;

describe('Get All Dacs Unit tests', () => {
  beforeAll(() => {
    container = new Container();

    container
      .bind<IndexWorldsCommon.Services.IndexWorldsContractService>(
        IndexWorldsCommon.Services.IndexWorldsContractService.Token
      )
      .toConstantValue(indexWorldsContractService as any);
    container
      .bind<GetAllDacsUseCase>(GetAllDacsUseCase.Token)
      .to(GetAllDacsUseCase);
  });

  beforeEach(() => {
    useCase = container.get<GetAllDacsUseCase>(GetAllDacsUseCase.Token);
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(GetAllDacsUseCase.Token).not.toBeNull();
  });

  it('Should return a failure when index.worlds contract service fails', async () => {
    indexWorldsContractService.fetchDacs.mockResolvedValueOnce(
      Result.withFailure(Failure.fromError(null))
    );

    const result = await useCase.execute(input);
    expect(result.isFailure).toBeTruthy();
  });

  it('should return an array of IndexWorldsCommon.Deltas.Entities.Dacs', async () => {
    indexWorldsContractService.fetchDacs.mockResolvedValueOnce(
      Result.withContent([
        <IndexWorldsCommon.Deltas.Types.DacsRawModel>{
          accounts: [{ key: 2, value: 'dao.worlds' }],
          sym: { symbol: 'EYE' },
          refs: [],
        },
      ])
    );

    const result = await useCase.execute(input);

    expect(result.content).toBeInstanceOf(Array);
    expect(result.content[0]).toBeInstanceOf(
      IndexWorldsCommon.Deltas.Entities.Dacs
    );
  });
});
