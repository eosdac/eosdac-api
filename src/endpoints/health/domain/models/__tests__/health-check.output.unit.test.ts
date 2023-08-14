import { HealthCheckOutput } from '../health-check.output';
import { HealthCheckStatus } from '../../entities/health-check-status';
import { Result } from '@alien-worlds/aw-core';

describe('HealthCheckOutput', () => {
    describe('create', () => {
        it('should create a HealthCheckOutput instance with a successful result', () => {
            const successfulResult = Result.withContent(HealthCheckStatus.create(
                'v1',
                { "@alien-worlds/aw-core": "^0.0.15" },
                { mongodb: 'OK' },
                1n
            ));

            const healthCheckOutput = HealthCheckOutput.create(successfulResult);

            expect(healthCheckOutput).toBeInstanceOf(HealthCheckOutput);
            expect(healthCheckOutput.result).toEqual(successfulResult);
        });

        it('should create a HealthCheckOutput instance with a failure result', () => {
            const failureResult = Result.withFailure(new Error('Some error message'));

            const healthCheckOutput = HealthCheckOutput.create(failureResult);

            expect(healthCheckOutput).toBeInstanceOf(HealthCheckOutput);
            expect(healthCheckOutput.result).toEqual(failureResult);
        });
    });

    describe('toJSON', () => {
        it('should return a JSON representation for a successful result', () => {
            const content = HealthCheckStatus.create(
                'v1',
                { "@alien-worlds/aw-core": "^0.0.15" },
                { mongodb: 'OK' },
                1n
            );
            const healthCheckOutput = new HealthCheckOutput(Result.withContent(content));

            expect(healthCheckOutput.toJSON()).toEqual(content.toJSON());
        });

        it('should return an error JSON representation for a failure result', () => {
            const errorMessage = 'Some error message';
            const healthCheckOutput = new HealthCheckOutput(Result.withFailure(errorMessage));

            expect(healthCheckOutput.toJSON()).toEqual({
                status: 'FAIL',
                error: errorMessage,
            });
        });
    });
});
