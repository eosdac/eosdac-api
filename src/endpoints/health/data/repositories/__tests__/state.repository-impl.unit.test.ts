import { Failure, MongoDB, UpdateStatus } from '@alien-worlds/api-core';

import { State } from '../../../domain/entities/state';
import { StateDocument } from '../../dtos/state.dto';
import { StateMapper } from '../../mappers/state.mapper';
import { StateRepositoryImpl } from '../state.repository-impl';

/*imports*/

const stateMongoSourceMock = {
    getCurrentBlock: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
};

describe('StateRepositoryImpl unit tests', () => {
    it('Should return State', async () => {
        stateMongoSourceMock.getCurrentBlock.mockResolvedValueOnce(<StateDocument>{
            name: 'currentBlock',
            value: MongoDB.Long.fromBigInt(123n),
        });

        const repository = new StateRepositoryImpl(
            stateMongoSourceMock as any,
            new StateMapper()
        );
        const result = await repository.getCurrentBlock();

        expect(result.content).toBeInstanceOf(State);
    });

    /*unit-tests*/

    it('Should return error when some error occurs fetching block', async () => {
        stateMongoSourceMock.getCurrentBlock.mockRejectedValueOnce('some error');

        const repository = new StateRepositoryImpl(
            stateMongoSourceMock as any,
            new StateMapper()
        );
        const result = await repository.getCurrentBlock();

        expect(result.failure).toBeInstanceOf(Failure);
    });

    it('Should return not found error when source returns empty response', async () => {
        stateMongoSourceMock.getCurrentBlock.mockResolvedValueOnce(undefined);

        const repository = new StateRepositoryImpl(
            stateMongoSourceMock as any,
            new StateMapper()
        );
        const result = await repository.getCurrentBlock();

        expect(result.failure).toBeInstanceOf(Failure);
        expect(result.failure.error).toBeInstanceOf(Error);
    });

    it('Should update the state', async () => {
        stateMongoSourceMock.update.mockResolvedValueOnce(<StateDocument>{
            name: 'currentBlock',
            value: MongoDB.Long.fromBigInt(123n),
        });

        const repository = new StateRepositoryImpl(
            stateMongoSourceMock as any,
            new StateMapper()
        );
        const result = await repository.update(
            State.fromDto({ value: MongoDB.Long.fromBigInt(123n) })
        );

        expect(result.content).toBe(UpdateStatus.Success);
        expect(stateMongoSourceMock.update).toBeCalled();
    });

    it('Should return failure when update fails', async () => {
        stateMongoSourceMock.update.mockRejectedValueOnce(new Error());

        const repository = new StateRepositoryImpl(
            stateMongoSourceMock as any,
            new StateMapper()
        );
        const result = await repository.update(
            State.fromDto({ value: MongoDB.Long.fromBigInt(123n) })
        );

        expect(result.failure).toBeInstanceOf(Failure);
        expect(stateMongoSourceMock.update).toBeCalled();
    });
});
