const openApi = require('./open-api');
const {loadConfig} = require('./functions');
const path = require('path');

const config = loadConfig();

const fastify = require('fastify')({
    ignoreTrailingSlash: true,
    trustProxy: true
});

fastify.register(require('fastify-oas'), openApi.options);

fastify.register(require('fastify-autoload'), {
    dir: path.join(__dirname, 'api-handlers'),
    options: {
        prefix: '/v1/eosdac'
    }
});

const mongo_url = `${config.mongo.url}/${config.mongo.dbName}`;
fastify.register(require('fastify-mongodb'), {
    url: mongo_url
});

fastify.register(require('./fastify-eos'), config);
fastify.register(require('./fastify-dac'), {});
fastify.register(require('./fastify-config'), config);

fastify.register(require('fastify-cors'), {
    allowedHeaders: 'Content-Type,X-DAC-Name',
    origin: '*'
});


fastify.ready().then(async () => {
    console.log(`Started API server with config ${process.env.CONFIG} on ${process.env.SERVER_ADDR || '127.0.0.1'}:${process.env.SERVER_PORT}`);
    await fastify.oas();
}, (err) => {
    console.error('Error starting API', err)
});

(async () => {
    try {
        await fastify.listen(process.env.SERVER_PORT, process.env.SERVER_ADDR)
    } catch (err) {
        fastify.log.error(err);
        console.error(err);
        process.exit(1)
    }
})();
