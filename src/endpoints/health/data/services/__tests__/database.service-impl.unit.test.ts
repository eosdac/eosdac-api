import ApiConfig from '@src/config/api-config';
import { DatabaseServiceImpl } from '../database.service-impl';
import { MongoHealthTest } from '../mongo.health-test';
import { Result } from '@alien-worlds/aw-core';

jest.mock('../mongo.health-test', () => ({
    MongoHealthTest: {
        testConnection: jest.fn(),
    },
}));

describe('DatabaseServiceImpl', () => {
    describe('checkConnection', () => {
        it('should return a successful result with "OK" when connection test succeeds', async () => {
            const mockApiConfig: ApiConfig = ApiConfig.create('./.env', './package.json');
            (MongoHealthTest.testConnection as jest.Mock).mockResolvedValue(Result.withContent(true));
            const databaseService = new DatabaseServiceImpl(mockApiConfig);

            const result = await databaseService.checkConnection();

            expect(result).toEqual(Result.withContent({ mongodb: 'OK' }));
        });

        it('should return a successful result with "FAIL" when connection test fails', async () => {
            const mockApiConfig: ApiConfig = ApiConfig.create('./.env', './package.json');
            (MongoHealthTest.testConnection as jest.Mock).mockResolvedValue(Result.withContent(false));
            const databaseService = new DatabaseServiceImpl(mockApiConfig);

            const result = await databaseService.checkConnection();

            expect(result).toEqual(Result.withContent({ mongodb: 'FAIL' }));
        });
    });
});
