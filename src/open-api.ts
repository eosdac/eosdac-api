import { config } from '@config';
import { FastifyStaticSwaggerOptions } from '@fastify/swagger';

const options: FastifyStaticSwaggerOptions = {
  mode: 'static',
  routePrefix: `/${config.version}/dao/docs`,
  exposeRoute: true,
  specification: {
    path: './docs/dao-api-oas.yaml',
    baseDir: '',
  },
};

export default options;
