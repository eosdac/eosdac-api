const openApi = require('./open-api');

const autoload = require('fastify-autoload');
const path = require('path');
const oas = require('fastify-oas')
const fastify = require('fastify')({
    ignoreTrailingSlash: true,
    trustProxy: true
});
fastify.register(oas, openApi.options);
fastify.register(autoload, {
    dir: path.join(__dirname, 'api-handlers'),
    options: {
        prefix: '/v1/eosdac'
    }
});


fastify.ready().then(async () => {
    console.log(`Started API server with config ${process.env.CONFIG} on ${process.env.SERVER_ADDR||'127.0.0.1'}:${process.env.SERVER_PORT}`);
    await fastify.oas();
}, (err) => {
    console.error('Error starting API', err)
});

(async () => {
    try {
        await fastify.listen(process.env.SERVER_PORT, process.env.SERVER_ADDR)
    } catch (err) {
        fastify.log.error(err);
        console.error(err)
        process.exit(1)
    }
})();
