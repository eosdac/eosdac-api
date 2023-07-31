import { DependencyInjector } from '@alien-worlds/aw-core';
import { PingController } from './domain/ping.controller';

export class PingDependencyInjector extends DependencyInjector {
  public async setup(): Promise<void> {
    const { container } = this;

    container.bind<PingController>(PingController.Token).to(PingController);
  }
}
