import 'reflect-metadata';

import { Container, Result } from '@alien-worlds/aw-core';
import { HealthCheckStatus } from '../../entities/health-check-status';
import { GetHealthCheckStatusUseCase } from '../get-health-check-status.use-case';
import ApiConfig from '@src/config/api-config';
import { HistoryService } from '../../services/history.service';
import { DatabaseService } from '../../services/database.service';

// const historyToolsBlockState = {
//   getBlockNumber: jest.fn(),
// };

let container: Container;
let useCase: GetHealthCheckStatusUseCase;

const historyService = {
  getCurrentBlockNumber: jest.fn(() => Result.withContent(-1n)),
};
const databaseService = {
  checkConnection: jest.fn(() => Result.withContent({ mongodb: 'OK' })),
};

describe('Health Unit tests', () => {
  beforeAll(() => {
    container = new Container();

    container.bind<ApiConfig>(ApiConfig.Token).toConstantValue({} as any);
    container
      .bind<HistoryService>(HistoryService.Token)
      .toConstantValue(historyService as any);
    container
      .bind<DatabaseService>(DatabaseService.Token)
      .toConstantValue(databaseService as any);
    container
      .bind<GetHealthCheckStatusUseCase>(GetHealthCheckStatusUseCase.Token)
      .to(GetHealthCheckStatusUseCase);
  });

  beforeEach(() => {
    useCase = container.get<GetHealthCheckStatusUseCase>(
      GetHealthCheckStatusUseCase.Token
    );
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(GetHealthCheckStatusUseCase.Token).not.toBeNull();
  });

  // it('Should return a failure when ...', async () => {
  //   historyToolsBlockState.getBlockNumber.mockResolvedValue(
  //     Result.withFailure(Failure.fromError(null))
  //   );

  //   const result = await useCase.execute();
  //   expect(result.isFailure).toBeTruthy();
  // });

  it('should return HealthOutput', async () => {
    // historyToolsBlockState.getBlockNumber.mockResolvedValue(
    //   Result.withContent(BigInt(1))
    // );

    const result = await useCase.execute();
    expect(result.content).toBeInstanceOf(HealthCheckStatus);
  });

  // it('should return current block', async () => {
  //   historyToolsBlockState.getBlockNumber.mockResolvedValue(
  //     Result.withContent(BigInt(1))
  //   );

  //   const result = await useCase.execute();
  //   expect(result.content.blockChainHistory.currentBlock).toBe(
  //     MongoDB.Long.ONE.toBigInt()
  //   );
  // });
});
