import { HealthCheckStatus } from '../health-check-status';
import { HealthCheckJsonModel } from '../../../data/dtos/health.dto';

const healthOutputDto: HealthCheckJsonModel = {
  status: 'OK',
  version: '1.0.0',
  timestamp: new Date('2023-02-15T13:41:25.153Z'),
  uptimeSeconds: 100,
  nodeVersion: 'v17.3.0',
  database: {
    mongodb: 'OK',
  },
  dependencies: {
    '@alien-worlds/aw-core': '0.0.68',
  },
  historyApi: {
    currentBlockNumber: '0',
    status: 'OK',
  },
};

const healthOutput = HealthCheckStatus.create(
  '1.0.0',
  {
    '@alien-worlds/aw-core': '0.0.68',
  },
  {
    mongodb: 'OK',
  },
  0n
);

describe('HealthOutput unit tests', () => {
  it('HealthOutput.fromDto should return HealthOutput object based on the provided dto', async () => {
    expect(healthOutput).toEqual(healthOutputDto);
  });

  it('"toJson" should return an object based on entity', async () => {
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
