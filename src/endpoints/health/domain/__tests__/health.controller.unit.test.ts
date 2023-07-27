import 'reflect-metadata';

import { Container } from '@alien-worlds/aw-core';
import { HealthController } from '../health.controller';
import { HealthUseCase } from '../use-cases/health.use-case';

const healthUseCase = {
  execute: jest.fn(() => ({})),
};

let container: Container;
let controller: HealthController;

describe('Health Controller Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    /*bindings*/
    container
      .bind<HealthUseCase>(HealthUseCase.Token)
      .toConstantValue(healthUseCase as any);
    container
      .bind<HealthController>(HealthController.Token)
      .to(HealthController);
  });

  beforeEach(() => {
    controller = container.get<HealthController>(HealthController.Token);
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(HealthController.Token).not.toBeNull();
  });

  it('Should execute HealthUseCase', async () => {
    await controller.health();

    expect(healthUseCase.execute).toBeCalled();
  });
});
