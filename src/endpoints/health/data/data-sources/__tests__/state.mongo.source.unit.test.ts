/* eslint-disable @typescript-eslint/no-explicit-any */
import { MongoDB, MongoSource } from '@alien-worlds/api-core';

import { StateMongoSource } from '../state.mongo.source';

/*imports*/
/*mocks*/
const db = {
    databaseName: 'TestDB',
    collection: jest.fn(() => ({
        findOne: jest.fn(),
    })) as any,
};

const mongoSource = new MongoSource(db as MongoDB.Db);

describe('StateMongoSource Unit tests', () => {
    const stateMongoSource: StateMongoSource = new StateMongoSource(mongoSource);

    /*unit-tests*/

    it('"Token" should be set', () => {
        expect(StateMongoSource.Token).not.toBeNull();
    });

    it('Should return StateDocument object', async () => {
        const fakeDocument = { _id: 'fake.state.document' };
        const findOneMock = jest
            .spyOn((stateMongoSource as any).collection, 'findOne')
            .mockImplementation(() => fakeDocument);

        const result = await stateMongoSource.getCurrentBlock();
        expect(result).toEqual(fakeDocument);

        findOneMock.mockReset();
    });
});
