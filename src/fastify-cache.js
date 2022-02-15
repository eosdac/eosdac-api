const fp = require('fastify-plugin');

const DacCache = require('./dac-cache');
const {IPC} = require('node-ipc');

module.exports = fp((fastify, options, next) => {
    fastify.decorate('cache', new DacCache());

    const ipc = new IPC();
    ipc.config.appspace = 'eosdac.';
    ipc.connectTo('eosdacprocessor', () => {
        ipc.of.eosdacprocessor.on('action', async (a) => {
            // console.log(dac_directory.msig_accounts());

            if (a.action && a.action.name === 'stprofile'){
                // invalidate profile cache
                let cache_name = `/v1/eosdac/profile?account=${a.action.data.cand}`;

                fastify.cache.set(a.action.data.dac_id, cache_name);
            }
            else if (a.action && a.action.account === 'dacmultisigs' && a.action.data.dac_id){
                fastify.cache.removePrefix(a.action.data.dac_id, `/v1/eosdac/msig_proposals`);
            }
        });
    });


    /*
fastify.addHook('preHandler', async (request, reply) => {
    const name = request.raw.url;
    const dac_id = request.dac();
    // console.log(`Reading cache for ${dac_id}, ${name}`);

    const body = fastify.cache.get(dac_id, name);
    if (body){
        reply.send(body);
    }

    return;
});

fastify.addHook('onSend', (request, reply, payload, done) => {
    /*
    const name = request.raw.url;
  l, data] = name.split('?');
    let store = false;

    if (url === '/v1/eosdac/profile'){
        const account_data = data.split('&').filter((v) => {return v.substr(0,8) === 'account='});
        // console.log(account_data[0].replace('account=', ''));
        if (account_data[0].indexOf(',') === -1){
            // only a single account, cache it
            store = true;
        }
    }
    else if (url === '/v1/eosdac/msig_proposals'){
        store = true;
    }

    if (store){
        const dac_id = request.dac();
        const body = payload;

        console.log(`Storing cache for ${dac_id}, ${name}`);
        fastify.cache.set(dac_id, name, body);
    }

        done(null, payload);
    })*/

    next();
}, {
    fastify: '>=1.0.0',
    name: 'fastify-cache'
});
