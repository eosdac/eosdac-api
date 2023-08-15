import { HealthCheckOutput } from '../../domain/models/health-check.output';
import { HealthCheckRouteIO } from '../health-check.route-io'
import { HealthCheckStatus } from '@endpoints/health/domain/entities/health-check-status';
import { Result } from '@alien-worlds/aw-core';

describe('HealthCheckRouteIO', () => {
  describe('toResponse', () => {
    it('should convert a successful HealthCheckOutput to a 200 Response', () => {
      const successfulHealthCheckOutput = HealthCheckOutput.create(Result.withContent(HealthCheckStatus.create(
        'v1',
        { "@alien-worlds/aw-core": "^0.0.15" },
        { mongodb: 'OK' },
        1n
      )));
      const healthCheckRouteIO = new HealthCheckRouteIO();

      const response = healthCheckRouteIO.toResponse(successfulHealthCheckOutput);

      expect(response).toBeDefined();
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });

    it('should convert a failed HealthCheckOutput to a 500 Response', () => {
      const errorMessage = 'Some error message';
      const failedHealthCheckOutput = HealthCheckOutput.create(Result.withFailure(errorMessage));
      const healthCheckRouteIO = new HealthCheckRouteIO();

      const response = healthCheckRouteIO.toResponse(failedHealthCheckOutput);

      expect(response).toEqual({
        status: 500,
        body: failedHealthCheckOutput.toJSON(),
      });
    });
  });
});
