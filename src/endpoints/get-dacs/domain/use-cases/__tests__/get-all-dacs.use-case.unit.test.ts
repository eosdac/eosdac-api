import 'reflect-metadata';

import * as IndexWorldsCommon from '@alien-worlds/index-worlds-common';

import { Container, Failure, Result } from '@alien-worlds/api-core';
import {
  ExtendedSymbolRawModel,
  Pair,
} from '@alien-worlds/eosio-contract-types';
import { Dac } from '../../entities/dacs';
import { GetAllDacsUseCase } from '../get-all-dacs.use-case';
import { GetDacsInput } from '../../models/dacs.input';

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

  it('should return an array of Dac', async () => {
    indexWorldsContractService.fetchDacs.mockResolvedValueOnce(
      Result.withContent([
        <IndexWorldsCommon.Deltas.Types.DacsRawModel>{
          owner: 'eyeke.dac',
          dac_id: 'eyeke',
          title: 'Eyeke',
          symbol: <ExtendedSymbolRawModel>{
            sym: '4,EYE',
            contract: 'token.worlds',
          },
          dac_state: 0,
          refs: [
            {
              key: '1',
              value: 'QmW1SeninpNQUMLstTPFTv7tMkRdBZMHBJTgf17Znr1uKK',
            },
            {
              key: '2',
              value:
                'Also known as Second Earth or Terra Alterna as it is the nearest, and closest, of all Alien Worlds to Earth. Humans found Eyeke inhabited by a Monastic order of Greys who believe that Eyeke is a spiritual place. Despite initial fears, Trilium mining seems to be tolerated by the Monks at this time.',
            },
            {
              key: '12',
              value: 'QmUXjmrQ6j2ukCdPjacdQ48MmYo853u4Y5y3kb5b4HBuuF',
            },
          ] as Pair<string, string>[],
          accounts: [{ key: '0', value: 'eyeke.world' }] as Pair<
            string,
            string
          >[],
        },
      ])
    );

    const result = await useCase.execute(input);

    expect(result.content).toBeInstanceOf(Array);
    expect(result.content[0]).toBeInstanceOf(Dac);
  });

  it('Should return a failure when index.worlds contract service returns empty result', async () => {
    indexWorldsContractService.fetchDacs.mockResolvedValueOnce(
      Result.withContent([])
    );

    const result = await useCase.execute(input);
    expect(result.isFailure).toBeTruthy();
  });
});
