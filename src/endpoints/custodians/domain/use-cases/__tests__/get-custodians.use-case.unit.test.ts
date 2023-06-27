/* eslint-disable @typescript-eslint/no-explicit-any */
import * as DaoWorldsCommon from '@alien-worlds/dao-worlds-common';
import { Container, Failure } from '@alien-worlds/api-core';
import { GetCustodiansUseCase } from '../get-custodians.use-case';

describe('GetCustodiansUseCase', () => {
  let container: Container;
  let useCase: GetCustodiansUseCase;

  const mockService = {
    fetchCustodians1: jest.fn(),
  };

  beforeAll(() => {
    container = new Container();

    container
      .bind<GetCustodiansUseCase>(GetCustodiansUseCase.Token)
      .toConstantValue(new GetCustodiansUseCase(mockService as any));
  });

  beforeEach(() => {
    useCase = container.get<GetCustodiansUseCase>(GetCustodiansUseCase.Token);
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('should return a list of custodians', async () => {
    const dacId = 'testdac';
    mockService.fetchCustodians1.mockResolvedValue({
      content: [
        <DaoWorldsCommon.Deltas.Types.Custodians1RawModel>{
          cust_name: 'custodian1',
          requestedpay: '10000000 TLM',
          total_vote_power: 1,
          rank: 1,
          number_voters: 1,
          avg_vote_time_stamp: new Date(),
        },
      ],
    });
    const result = await useCase.execute(dacId);

    expect(result.content).toBeInstanceOf(Array);

    const candidate = result
      .content[0] as DaoWorldsCommon.Deltas.Entities.Custodians1;

    expect(candidate).toBeInstanceOf(
      DaoWorldsCommon.Deltas.Entities.Custodians1
    );
  });

  it('should return an empty array if no candidates are found', async () => {
    const dacId = 'emptydac';
    mockService.fetchCustodians1.mockResolvedValue({
      content: [],
    });
    const result = await useCase.execute(dacId);

    expect(result.content).toEqual([]);
  });

  it('should return a failure if the service fails', async () => {
    const dacId = 'faileddac';
    mockService.fetchCustodians1.mockResolvedValue({
      failure: Failure.withMessage('error'),
    });
    const result = await useCase.execute(dacId);
    expect(result.content).toBeFalsy();
  });
});
