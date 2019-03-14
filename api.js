const autoload = require('fastify-autoload');
const path = require('path');
const fastify = require('fastify')({
    ignoreTrailingSlash: true,
    trustProxy: true
});
fastify.register(autoload, {
    dir: path.join(__dirname, 'api-handlers'),
    options: {
        prefix: '/v1/eosdac'
    }
});



(async () => {
    try {
        await fastify.listen(process.env.SERVER_PORT, process.env.SERVER_ADDR);
        fastify.log.info(`server listening on ${fastify.server.address().port}`)
    } catch (err) {
        fastify.log.error(err);
        console.error(err)
        process.exit(1)
    }
})();
