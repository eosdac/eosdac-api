import 'reflect-metadata';

import { Container, Result } from '@alien-worlds/aw-core';

import { PingController } from '../ping.controller'
import { PingOutput } from '../models/ping.output';

let container: Container;
let controller: PingController;

describe('PingController', () => {
  describe('ping', () => {
    beforeAll(() => {
      container = new Container();

      container
        .bind<PingController>(PingController.Token)
        .to(PingController);
    });

    beforeEach(() => {
      controller = container.get<PingController>(
        PingController.Token
      );
    });

    afterAll(() => {
      jest.clearAllMocks();
      container = null;
    });

    it('"Token" should be set', () => {
      expect(PingController.Token).not.toBeNull();
    });

    it('should return a PingOutput with "pong"', async () => {
      const pingController = new PingController();

      const pingOutput = await pingController.ping();

      expect(pingOutput).toBeInstanceOf(PingOutput);
      expect(pingOutput.result).toEqual(Result.withContent('pong'));
    });
  });
});
