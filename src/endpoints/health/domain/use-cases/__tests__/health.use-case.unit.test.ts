import 'reflect-metadata';

import { Container } from '@alien-worlds/aw-core';
import { HealthCheckStatus } from '../../entities/health-check-status';
import { GetHealthCheckStatusUseCase } from '../get-health-check-status.use-case';

// const historyToolsBlockState = {
//   getBlockNumber: jest.fn(),
// };

let container: Container;
let useCase: GetHealthCheckStatusUseCase;

describe('Health Unit tests', () => {
  beforeAll(() => {
    container = new Container();

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
