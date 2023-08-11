import ApiConfig from '@src/config/api-config'; // Adjust the import path based on your project structure
import { HistoryServiceImpl } from '../history.service-impl'; // Update the import path based on your project structure
import { Result } from '@alien-worlds/aw-core';

const mockFetch = jest.fn();
(global as any).fetch = mockFetch;

const mockApiConfig: ApiConfig = ApiConfig.create('./.env', './package.json');

describe('HistoryServiceImpl', () => {
    describe('getCurrentBlockNumber', () => {
        it('should return a successful result with the current block number when fetch is successful', async () => {
            const mockResponseJson = { currentBlockNumber: 12345 };
            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => mockResponseJson,
            });

            const historyService = new HistoryServiceImpl(mockApiConfig);
            const result = await historyService.getCurrentBlockNumber();

            expect(result).toBeDefined();
            expect(result.content).toBe(12345);
        });

        it('should return a failure result with error message when fetch fails', async () => {
            const mockError = new Error('Mock fetch error');
            mockFetch.mockRejectedValue(mockError);

            const historyService = new HistoryServiceImpl(mockApiConfig);
            const result = await historyService.getCurrentBlockNumber();
            expect(result).toEqual(Result.withFailure(`unable to fetch current block. ${mockError.message}`));
        });

        it('should return a failure result with statusText when fetch response is not ok', async () => {
            const mockStatusText = 'Bad Request';
            mockFetch.mockResolvedValue({
                ok: false,
                statusText: mockStatusText,
            });

            const historyService = new HistoryServiceImpl(mockApiConfig);
            const result = await historyService.getCurrentBlockNumber();
            expect(result).toEqual(Result.withFailure(`unable to fetch current block. ${mockStatusText}`));
        });
    });
});
