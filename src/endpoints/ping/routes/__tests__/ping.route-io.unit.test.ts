import { GetPingRouteIO } from '../ping.route-io';
import { PingOutput } from '../../domain/models/ping.output';
import { Result } from '@alien-worlds/aw-core';

describe('GetPingRouteIO', () => {
  describe('toResponse', () => {
    it('should convert a successful PingOutput to a successful Response', () => {
      const pingOutput = PingOutput.create(Result.withContent('pong'));
      const getPingRouteIO = new GetPingRouteIO();

      const response = getPingRouteIO.toResponse(pingOutput);

      expect(response).toEqual({
        status: 200,
        body: pingOutput.toJSON(),
      });
    });

    it('should convert a failed PingOutput with error to a 500 error Response', () => {
      const errorMessage = 'Some error message';
      const failedPingOutput = PingOutput.create(Result.withFailure(errorMessage));

      const getPingRouteIO = new GetPingRouteIO();

      const response = getPingRouteIO.toResponse(failedPingOutput);

      expect(response).toEqual({
        status: 500,
        body: {
          status: 'FAIL',
          error: errorMessage,
        },
      });
    });
  });
});
