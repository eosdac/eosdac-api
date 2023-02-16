import 'reflect-metadata';

import { Failure, MongoDB, Result } from '@alien-worlds/api-core';

import { Container } from 'inversify';
import { HealthOutput } from '../../entities/health-output';
import { HealthUseCase } from '../health.use-case';
import { State } from '../../entities/state';
import { StateRepository } from '../../repositories/state.repository';

/*imports*/
/*mocks*/

const stateRepository = {
    getCurrentBlock: jest.fn(),
};

let container: Container;
let useCase: HealthUseCase;

describe('Health Unit tests', () => {
    beforeAll(() => {
        container = new Container();

        container
            .bind<StateRepository>(StateRepository.Token)
            .toConstantValue(stateRepository as any);
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
        stateRepository.getCurrentBlock.mockResolvedValue(Result.withFailure(Failure.fromError(null)))

        const result = await useCase.execute();
        expect(result.isFailure).toBeTruthy();
    });

    it('should return HealthOutput', async () => {
        stateRepository.getCurrentBlock.mockResolvedValue(Result.withContent(State.fromDto({
            name: 'current_block',
            value: MongoDB.Long.ONE,
        })))

        const result = await useCase.execute();
        expect(result.content).toBeInstanceOf(HealthOutput);
    });

    it('should return current block', async () => {
        stateRepository.getCurrentBlock.mockResolvedValue(Result.withContent(State.fromDto({
            name: 'current_block',
            value: MongoDB.Long.ONE,
        })))

        const result = await useCase.execute();
        expect(result.content.blockChainHistory.currentBlock).toBe(MongoDB.Long.ONE.toBigInt())
    });

    /*unit-tests*/
});

