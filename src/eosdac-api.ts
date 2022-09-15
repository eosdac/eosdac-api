#!/usr/bin/env node

process.title = 'eosdac-api';

const fastify = require('fastify');
const path = require('path');

const openApi = require('./open-api');
const config = require('./functions').loadConfig();

import logger = require('./connections/logger');
logger('eosdac-api', config.logger)


const buildAPIServer = async () => {
    const api = fastify({
        ignoreTrailingSlash: true,
        trustProxy: true,
        logger
    });

    const prefix = '/v1/eosdac';

    api.register(require('./api-handlers/balanceTimeline'), { prefix })
    api.register(require('./api-handlers/candidates'), { prefix })
    api.register(require('./api-handlers/dacConfig'), { prefix })
    api.register(require('./api-handlers/dacInfo'), { prefix })
    api.register(require('./api-handlers/financialReports'), { prefix })
    api.register(require('./api-handlers/getMsigProposals'), { prefix })
    api.register(require('./api-handlers/getProfile'), { prefix })
    api.register(require('./api-handlers/getProposals'), { prefix })
    api.register(require('./api-handlers/member'), { prefix })
    api.register(require('./api-handlers/memberCounts'), { prefix })
    api.register(require('./api-handlers/memberSnapshot'), { prefix })
    api.register(require('./api-handlers/myDacs'), { prefix })
    api.register(require('./api-handlers/proposalsCounts'), { prefix })
    api.register(require('./api-handlers/proposalsInbox'), { prefix })
    api.register(require('./api-handlers/referendums'), { prefix })
    api.register(require('./api-handlers/state'), { prefix })
    api.register(require('./api-handlers/tokensOwned'), { prefix })
    api.register(require('./api-handlers/transfers'), { prefix })
    api.register(require('./api-handlers/voters'), { prefix })
    api.register(require('./api-handlers/votesTimeline'), { prefix })

    api.register(require('fastify-oas'), openApi.options);

    const mongo_url = `${config.mongo.url}/${config.mongo.dbName}`;
    api.register(require('fastify-mongodb'), {
        url: mongo_url
    });

    api.register(require('./fastify-eos'), config);
    api.register(require('./fastify-dac'), {});
    api.register(require('./fastify-config'), config);
    // api.register(require('./fastify-cache'), {});

    api.register(require('fastify-cors'), {
        allowedHeaders: 'Content-Type,X-DAC-Name',
        origin: '*'
    });

    api.ready().then(
        async () => {
            console.log(
                `Started API server with config ${process.env.CONFIG} on ${process.env.SERVER_ADDR || '127.0.0.1'
                }:${process.env.SERVER_PORT}`
            );
            await api.oas();
        },
        err => {
            console.error('Error starting API', err);
        }
    );

    api.ready().then(async () => {
        console.log(`Started API server with config ${process.env.CONFIG} on ${process.env.SERVER_ADDR || '127.0.0.1'}:${process.env.SERVER_PORT}`);
        await api.oas();
    }, (err) => {
        console.error('Error starting API', err)
    });

    return api;
}

const startAPIServer = async () => {
    try {
        const api = await buildAPIServer();
        await api.listen(process.env.SERVER_PORT, process.env.SERVER_ADDR);
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
};

startAPIServer();

module.exports = {
    buildAPIServer,
    startAPIServer,
}