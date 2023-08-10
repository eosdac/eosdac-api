import { HealthCheckJsonModel } from '../../../data/dtos/health.dto';
import { HealthCheckStatus } from '../health-check-status';

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
  it('"toJson" should return an object based on entity', async () => {
    const json = healthOutput.toJSON();

    expect(json.database).toEqual({
      mongodb: 'OK',
    });
    expect(json.dependencies).toEqual({
      '@alien-worlds/aw-core': '0.0.68',
    });
    expect(json.historyApi).toEqual({
      currentBlockNumber: '0',
      status: 'FAILED',
    });

    expect(json.status).toEqual('OK');
    expect(json.version).toEqual('1.0.0');
    expect(json.nodeVersion).toMatch(/^v\d+.\d+.\d+$/);
  });
});
