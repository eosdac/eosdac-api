import { Failure, Result } from '@alien-worlds/api-core';
import { DacDirectory, DacsTableRow, IndexWorldsContractService } from '@alien-worlds/eosdac-api-common';
import { Container } from 'inversify';

import { GetDacsInput } from '../../models/dacs.input';
import { GetAllDacsUseCase } from '../get-all-dacs.use-case';

import 'reflect-metadata';

/*imports*/
/*mocks*/

const indexWorldsContractService = {
  fetchDacs: jest.fn(),
};

const input: GetDacsInput = {
  dacId: 'string',
  scope: 'string',
  limit: 1,
}

let container: Container;
let useCase: GetAllDacsUseCase;

describe('Get All Dacs Unit tests', () => {
  beforeAll(() => {
    container = new Container();

    container
      .bind<IndexWorldsContractService>(IndexWorldsContractService.Token)
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
    indexWorldsContractService.fetchDacs.mockResolvedValueOnce(Result.withFailure(Failure.fromError(null)))

    const result = await useCase.execute(input);
    expect(result.isFailure).toBeTruthy();
  });

  it('should return an array of DacDirectory', async () => {
    indexWorldsContractService.fetchDacs.mockResolvedValueOnce(Result.withContent([<DacsTableRow>{
      accounts: [{ key: 2, value: 'dao.worlds' }],
      symbol: { sym: 'EYE' },
      refs: [],
    }]))

    const result = await useCase.execute(input);

    expect(result.content).toBeInstanceOf(Array);
    expect(result.content[0]).toBeInstanceOf(DacDirectory);
  });

  /*unit-tests*/
});

