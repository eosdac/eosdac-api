import { ExtendedSymbolRawModel, Pair } from '@alien-worlds/aw-antelope';
import * as IndexWorldsCommon from '@alien-worlds/aw-contract-index-worlds';
import { config } from '@config';
import { Dac } from '@endpoints/dacs/domain/entities/dacs';

import { loadDacConfig } from '../dac.utils';

jest.mock('@config', () => {
  return {
    config: {
      antelope: 'index.worlds',
      dac: {
        nameCache: {
          get: jest.fn(),
          set: jest.fn(),
        },
      },
    },
  };
});

describe('"DAC utils" unit tests', () => {
  let indexWorldsContractService;
  let dacId: string;

  beforeEach(() => {
    indexWorldsContractService = {
      fetchDacs: jest.fn(),
    } as any;
    dacId = 'eyeke';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return cached dac info if available', async () => {
    const cachedDacInfo: Map<string, Dac> = new Map();
    cachedDacInfo.set(dacId, Dac.getDefault());
    jest
      .spyOn(config.dac.nameCache, 'get')
      .mockReturnValue(cachedDacInfo as any);

    const result = await loadDacConfig(indexWorldsContractService, dacId);

    expect(config.dac.nameCache.get).toHaveBeenCalledWith(dacId);
    expect(result.content).toBe(cachedDacInfo);
  });

  it('should fetch dac info if not available in cache', async () => {
    jest.spyOn(config.dac.nameCache, 'get').mockReturnValue(null);

    const content: IndexWorldsCommon.Deltas.Types.DacsRawModel[] = [
      {
        owner: 'eyeke.dac',
        dac_id: dacId,
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
        accounts: [{ key: '1', value: 'eyeke.world' }] as Pair[],
      },
    ];

    const svcResponse = {
      isFailure: false,
      content,
    };
    indexWorldsContractService.fetchDacs.mockResolvedValue(svcResponse);

    await loadDacConfig(indexWorldsContractService, dacId);

    expect(indexWorldsContractService.fetchDacs).toHaveBeenCalledWith({
      scope: config.antelope.dacDirectoryContract,
      limit: 1,
      lower_bound: dacId,
      upper_bound: dacId,
    });
  });

  it('should return null if dac is not found', async () => {
    jest.spyOn(config.dac.nameCache, 'get').mockReturnValue(null);

    const svcResponse = {
      isFailure: true,
      content: [],
    };
    indexWorldsContractService.fetchDacs.mockResolvedValue(svcResponse);

    const result = await loadDacConfig(indexWorldsContractService, dacId);

    expect(config.dac.nameCache.get).toHaveBeenCalledWith(dacId);
    expect(indexWorldsContractService.fetchDacs).toHaveBeenCalledWith({
      scope: config.antelope.dacDirectoryContract,
      limit: 1,
      lower_bound: dacId,
      upper_bound: dacId,
    });

    expect(result).toBeDefined();
    expect(result.isFailure).toBeTruthy();
  });
});
