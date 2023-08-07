import { config } from '@config';
import { FastifyStaticSwaggerOptions } from '@fastify/swagger';

const options: FastifyStaticSwaggerOptions = {
  mode: 'static',
  routePrefix: `/${config.urlVersion}${config.docs.routePrefix}`,
  exposeRoute: true,
  specification: {
    path: './docs/aw-api-dao-oas.yaml',
    baseDir: '',
  },
};

export default options;
