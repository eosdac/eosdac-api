import { MongoConfig, MongoSource } from '@alien-worlds/aw-storage-mongodb';

import { MongoHealthTest } from '../mongo.health-test'
import { Result } from '@alien-worlds/aw-core';

// Mocking the external dependencies
jest.mock('@alien-worlds/aw-storage-mongodb', () => ({
    MongoSource: {
        create: jest.fn(() => ({
            client: {
                close: jest.fn(),
            },
        })),
    },
}));

const mockMongoConfig: MongoConfig = {
    database: 'dbname',
    hosts: ['0.0.0.0'],
};

describe('MongoHealthTest', () => {
    describe('testConnection', () => {
        it('should return a successful result when connection test succeeds', async () => {
            const result = await MongoHealthTest.testConnection(mockMongoConfig);

            expect(result).toEqual(Result.withContent(true));
        });

        it('should return a failed result and log error when connection test fails', async () => {
            (MongoSource.create as jest.Mock).mockRejectedValue(new Error('Mock error message'));

            const result = await MongoHealthTest.testConnection(mockMongoConfig);

            expect(result).toEqual(Result.withContent(false));
        });
    });
});
