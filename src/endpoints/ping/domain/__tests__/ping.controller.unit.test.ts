import 'reflect-metadata';

import { PingController } from '../ping.controller'
import { PingOutput } from '../models/ping.output';
import { Result } from '@alien-worlds/aw-core';

describe('PingController', () => {
  describe('ping', () => {
    it('should return a PingOutput with "pong"', async () => {
      const pingController = new PingController();

      const pingOutput = await pingController.ping();

      expect(pingOutput).toBeInstanceOf(PingOutput);
      expect(pingOutput.result).toEqual(Result.withContent('pong'));
    });
  });
});
