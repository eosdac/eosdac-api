#!/usr/bin/env node

/* istanbul ignore file */
import 'reflect-metadata';

import { buildAPIServer } from './aw-api-dao';
import { config } from './config';

process.title = 'aw-api-dao';

const start = async () => {
  try {
    const server = await buildAPIServer();
    await server.listen(config.port, config.host);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

start();
