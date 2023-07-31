import { HealthCheckStatus } from '../health-check-status';
import { HealthCheckJsonModel } from '../../../data/dtos/health.dto';

const healthOutputDto: HealthCheckJsonModel = {
  status: 'OK',
  version: '1.0.0',
  timestamp: new Date('2023-02-15T13:41:25.153Z'),
  uptimeSeconds: 100,
  nodeVersion: 'v17.3.0',
  database: {
    status: 'OK',
  },
  dependencies: [
    {
      name: '@alien-worlds/aw-core',
      version: '0.0.68',
    },
  ],
  historyApi: {
    currentBlock: 0n,
    status: 'OK',
  },
};

describe('HealthOutput unit tests', () => {
  it('HealthOutput.fromDto should return HealthOutput object based on the provided dto', async () => {
    const healthOutput = HealthCheckStatus.fromDto(healthOutputDto);

    expect(healthOutput).toEqual(healthOutputDto);
  });

  it('"toDto" should return a dto based on entity', async () => {
    const healthOutput = HealthCheckStatus.fromDto(healthOutputDto);

    expect(healthOutput.toDto()).toEqual(healthOutputDto);
  });

  it('"toJson" should return an object based on entity', async () => {
    const healthOutput = HealthCheckStatus.fromDto(healthOutputDto);

    expect(healthOutput.toJSON()).toEqual({
      status: 'OK',
      version: '1.0.0',
      timestamp: 1676468485153,
      uptimeSeconds: 100,
      nodeVersion: 'v17.3.0',
      dependencies: {
        '@alien-worlds/aw-core': '0.0.68',
      },
      database: { status: 'OK' },
      blockChainHistory: { currentBlock: '0', status: 'OK' },
    });
  });
});
