import * as AlienWorldsCommon from '@alien-worlds/alien-worlds-common';
import { Container, Failure, Result } from '@alien-worlds/api-core';
import * as DaoWorldsCommon from '@alien-worlds/dao-worlds-common';
import * as IndexWorldsCommon from '@alien-worlds/index-worlds-common';
import * as TokenWorldsCommon from '@alien-worlds/token-worlds-common';

import { GetDacsController } from '../get-dacs.controller';
import { GetDacsInput } from '../models/dacs.input';
import { GetAllDacsUseCase } from '../use-cases/get-all-dacs.use-case';
import { GetDacInfoUseCase } from '../use-cases/get-dac-info.use-case';
import { GetDacTokensUseCase } from '../use-cases/get-dac-tokens.use-case';
import { GetDacTreasuryUseCase } from '../use-cases/get-dac-treasury.use-case';

import 'reflect-metadata';

/*mocks*/
const getAllDacsUseCase = {
  execute: jest.fn(() =>
    Result.withContent([
      // new IndexWorldsCommon.Deltas.Mappers.DacsRawMapper().toEntity(<
      //   IndexWorldsCommon.Deltas.Types.DacsRawModel
      // >{
      //   accounts: [
      //     { key: 0, value: 'dao.worlds' },
      //     { key: 2, value: 'dao.worlds' },
      //   ],
      //   sym: { symbol: 'EYE' },
      //   refs: [],
      // }),
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
          // {
          //   key: 'auth_threshold_high',
          //   value: ['uint8', '3'],
          // },
        ],
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
};

let container: Container;
let controller: GetDacsController;

describe('GetDacs Controller Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    /*bindings*/
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
    container
      .bind<GetDacsController>(GetDacsController.Token)
      .to(GetDacsController);
  });

  beforeEach(() => {
    controller = container.get<GetDacsController>(GetDacsController.Token);
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(GetDacsController.Token).not.toBeNull();
  });

  it('Should execute GetAllDacsUseCase', async () => {
    await controller.dacs(input);

    expect(getAllDacsUseCase.execute).toBeCalled();
  });

  it('Should execute GetDacTreasuryUseCase', async () => {
    await controller.dacs(input);

    expect(getDacTreasuryUseCase.execute).toBeCalled();
  });

  it('Should execute GetDacInfoUseCase', async () => {
    await controller.dacs(input);

    expect(getDacInfoUseCase.execute).toBeCalled();
  });

  it('Should execute GetDacTokensUseCase', async () => {
    await controller.dacs(input);

    expect(getDacTokensUseCase.execute).toBeCalled();
  });

  it('Should return failure when GetAllDacsUseCase fails', async () => {
    getAllDacsUseCase.execute.mockImplementationOnce(
      jest.fn(() => Result.withFailure(Failure.fromError(null)))
    );

    const result = await controller.dacs(input);

    expect(result.isFailure).toBeTruthy();
  });

  it('Should return failure when GetDacTreasuryUseCase fails', async () => {
    getDacTreasuryUseCase.execute.mockImplementationOnce(
      jest.fn(() => Result.withFailure(Failure.fromError(null)))
    );

    const result = await controller.dacs(input);

    expect(result.isFailure).toBeTruthy();
  });

  it('Should return failure when GetDacInfoUseCase fails', async () => {
    getDacInfoUseCase.execute.mockImplementationOnce(
      jest.fn(() => Result.withFailure(Failure.fromError(null)))
    );

    const result = await controller.dacs(input);

    expect(result.isFailure).toBeTruthy();
  });

  it('Should return failure when GetDacTokensUseCase fails', async () => {
    getDacTokensUseCase.execute.mockImplementationOnce(
      jest.fn(() => Result.withFailure(Failure.fromError(null)))
    );

    const result = await controller.dacs(input);

    expect(result.isFailure).toBeTruthy();
  });
});
