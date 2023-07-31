import * as AlienWorldsCommon from '@alien-worlds/aw-contract-alien-worlds';
import * as DaoWorldsCommon from '@alien-worlds/aw-contract-dao-worlds';
import * as IndexWorldsCommon from '@alien-worlds/aw-contract-index-worlds';
import * as TokenWorldsCommon from '@alien-worlds/aw-contract-token-worlds';
import { Container, Failure, Result } from '@alien-worlds/aw-core';
import { ExtendedSymbolRawModel, Pair } from '@alien-worlds/aw-antelope';

import { DacMapper } from '@endpoints/dacs/data/mappers/dacs.mapper';
import { GetAllDacsUseCase } from '../use-cases/get-all-dacs.use-case';
import { GetDacInfoUseCase } from '../use-cases/get-dac-info.use-case';
import { DacsController } from '../dacs.controller';
import { GetDacsInput } from '../models/dacs.input';
import { GetDacTokensUseCase } from '../use-cases/get-dac-tokens.use-case';
import { GetDacTreasuryUseCase } from '../use-cases/get-dac-treasury.use-case';

const getAllDacsUseCase = {
  execute: jest.fn(() =>
    Result.withContent([
      new DacMapper().toDac(
        new IndexWorldsCommon.Deltas.Mappers.DacsRawMapper().toEntity(<
          IndexWorldsCommon.Deltas.Types.DacsRawModel
        >{
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
        })
      ),
    ])
  ),
};

const getDacTreasuryUseCase = {
  execute: jest.fn(() =>
    Result.withContent([
      new AlienWorldsCommon.Deltas.Mappers.AccountsRawMapper().toEntity(<
        AlienWorldsCommon.Deltas.Types.AccountsRawModel
      >{
        balance: 'string',
      }),
    ])
  ),
};
const getDacInfoUseCase = {
  execute: jest.fn(() =>
    Result.withContent([
      new DaoWorldsCommon.Deltas.Mappers.DacglobalsRawMapper().toEntity({
        data: [
          { key: 'auth_threshold_high', value: ['uint8', 3] },
          { key: 'auth_threshold_low', value: ['uint8', 2] },
          { key: 'auth_threshold_mid', value: ['uint8', 3] },
          { key: 'budget_percentage', value: ['uint32', 200] },
          { key: 'initial_vote_quorum_percent', value: ['uint32', 2] },
          {
            key: 'lastclaimbudgettime',
            value: ['time_point_sec', '2023-07-12T06:59:34'],
          },
          {
            key: 'lastperiodtime',
            value: ['time_point_sec', '2023-07-12T02:13:16'],
          },
          { key: 'lockup_release_time_delay', value: ['uint32', 1] },
          {
            key: 'lockupasset',
            value: [
              'extended_asset',
              { quantity: '5000.0000 EYE', contract: 'token.worlds' },
            ],
          },
          { key: 'maxvotes', value: ['uint8', 2] },
          { key: 'met_initial_votes_threshold', value: ['bool', 1] },
          { key: 'number_active_candidates', value: ['uint32', 16] },
          { key: 'numelected', value: ['uint8', 5] },
          { key: 'periodlength', value: ['uint32', 604800] },
          {
            key: 'requested_pay_max',
            value: [
              'extended_asset',
              { quantity: '0.0000 TLM', contract: 'alien.worlds' },
            ],
          },
          { key: 'should_pay_via_service_provider', value: ['bool', 0] },
          { key: 'token_supply_theshold', value: ['uint64', 100000000] },
          {
            key: 'total_votes_on_candidates',
            value: ['int64', '419531173046'],
          },
          {
            key: 'total_weight_of_votes',
            value: ['int64', '84271574980'],
          },
          { key: 'vote_quorum_percent', value: ['uint32', 1] },
        ] as any,
      }),
    ])
  ),
};

const getDacTokensUseCase = {
  execute: jest.fn(() =>
    Result.withContent([
      new TokenWorldsCommon.Deltas.Mappers.StatRawMapper().toEntity({
        supply: '1660485.1217 EYE',
        max_supply: '10000000000.0000 EYE',
        issuer: 'federation',
        transfer_locked: false,
      }),
    ])
  ),
};

const input: GetDacsInput = {
  dacId: 'string',
  limit: 1,
  toJSON: () => ({
    dacId: 'string',
    limit: 1,
  }),
};

let container: Container;
let controller: DacsController;

describe('GetDacs Controller Unit tests', () => {
  beforeAll(() => {
    container = new Container();

    container
      .bind<GetAllDacsUseCase>(GetAllDacsUseCase.Token)
      .toConstantValue(getAllDacsUseCase as any);
    container
      .bind<GetDacTreasuryUseCase>(GetDacTreasuryUseCase.Token)
      .toConstantValue(getDacTreasuryUseCase as any);
    container
      .bind<GetDacInfoUseCase>(GetDacInfoUseCase.Token)
      .toConstantValue(getDacInfoUseCase as any);
    container
      .bind<GetDacTokensUseCase>(GetDacTokensUseCase.Token)
      .toConstantValue(getDacTokensUseCase as any);
    container.bind<DacsController>(DacsController.Token).to(DacsController);
  });

  beforeEach(() => {
    controller = container.get<DacsController>(DacsController.Token);
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(DacsController.Token).not.toBeNull();
  });

  it('Should execute GetAllDacsUseCase', async () => {
    await controller.getDacs(input);

    expect(getAllDacsUseCase.execute).toBeCalled();
  });

  it('Should execute GetDacTreasuryUseCase', async () => {
    await controller.getDacs(input);

    expect(getDacTreasuryUseCase.execute).toBeCalled();
  });

  it('Should execute GetDacInfoUseCase', async () => {
    await controller.getDacs(input);

    expect(getDacInfoUseCase.execute).toBeCalled();
  });

  it('Should execute GetDacTokensUseCase', async () => {
    await controller.getDacs(input);

    expect(getDacTokensUseCase.execute).toBeCalled();
  });

  it('Should return failure when GetAllDacsUseCase fails', async () => {
    getAllDacsUseCase.execute.mockImplementationOnce(
      jest.fn(() => Result.withFailure(Failure.fromError(null)))
    );

    const output = await controller.getDacs(input);

    expect(output.result.isFailure).toBeTruthy();
  });

  it('Should return failure when GetDacTreasuryUseCase fails', async () => {
    getDacTreasuryUseCase.execute.mockImplementationOnce(
      jest.fn(() => Result.withFailure(Failure.fromError(null)))
    );

    const output = await controller.getDacs(input);

    expect(output.result.isFailure).toBeTruthy();
  });

  it('Should return failure when GetDacInfoUseCase fails', async () => {
    getDacInfoUseCase.execute.mockImplementationOnce(
      jest.fn(() => Result.withFailure(Failure.fromError(null)))
    );

    const output = await controller.getDacs(input);

    expect(output.result.isFailure).toBeTruthy();
  });

  it('Should return failure when GetDacTokensUseCase fails', async () => {
    getDacTokensUseCase.execute.mockImplementationOnce(
      jest.fn(() => Result.withFailure(Failure.fromError(null)))
    );

    const output = await controller.getDacs(input);

    expect(output.result.isFailure).toBeTruthy();
  });
});
