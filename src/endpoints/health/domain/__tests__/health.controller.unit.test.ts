import 'reflect-metadata';

import { Container } from '@alien-worlds/aw-core';
import { HealthController } from '../health.controller';
import { GetHealthCheckStatusUseCase } from '../use-cases/get-health-check-status.use-case';

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
      .bind<GetHealthCheckStatusUseCase>(GetHealthCheckStatusUseCase.Token)
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
    await controller.healthCheck();

    expect(healthUseCase.execute).toBeCalled();
  });
});
