import 'reflect-metadata';

import { Failure, MongoDB, Result } from '@alien-worlds/api-core';

import { Container } from 'inversify';
import { HealthOutput } from '../../entities/health-output';
import { HealthUseCase } from '../health.use-case';
import { HistoryToolsBlockState } from '@alien-worlds/dao-api-common';

/*imports*/
/*mocks*/

const historyToolsBlockState = {
    getBlockNumber: jest.fn(),
};

let container: Container;
let useCase: HealthUseCase;

describe('Health Unit tests', () => {
    beforeAll(() => {
        container = new Container();

        container
            .bind<HistoryToolsBlockState>(HistoryToolsBlockState.Token)
            .toConstantValue(historyToolsBlockState as any);
        container
            .bind<HealthUseCase>(HealthUseCase.Token)
            .to(HealthUseCase);
    });

    beforeEach(() => {
        useCase = container.get<HealthUseCase>(HealthUseCase.Token);
    });

    afterAll(() => {
        jest.clearAllMocks();
        container = null;
    });

    it('"Token" should be set', () => {
        expect(HealthUseCase.Token).not.toBeNull();
    });

    it('Should return a failure when ...', async () => {
        historyToolsBlockState.getBlockNumber.mockResolvedValue(Result.withFailure(Failure.fromError(null)))

        const result = await useCase.execute();
        expect(result.isFailure).toBeTruthy();
    });

    it('should return HealthOutput', async () => {
        historyToolsBlockState.getBlockNumber.mockResolvedValue(Result.withContent(BigInt(1)))

        const result = await useCase.execute();
        expect(result.content).toBeInstanceOf(HealthOutput);
    });

    it('should return current block', async () => {
        historyToolsBlockState.getBlockNumber.mockResolvedValue(Result.withContent(BigInt(1)))

        const result = await useCase.execute();
        expect(result.content.blockChainHistory.currentBlock).toBe(MongoDB.Long.ONE.toBigInt())
    });

    /*unit-tests*/
});

