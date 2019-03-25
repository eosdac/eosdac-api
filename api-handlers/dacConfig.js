const {dacConfigSchema} = require('../schemas');

const {TextDecoder, TextEncoder} = require('text-encoding');
const {Api, JsonRpc} = require('eosjs');
const fetch = require('node-fetch');

const {loadConfig} = require('../functions');


async function getDacConfig(fastify, request) {
    // console.log(request)


    return new Promise(async (resolve, reject) => {
        const config = loadConfig();

        const rpc = new JsonRpc(config.eos.endpoint, {fetch});
        const api = new Api({
            rpc,
            signatureProvider: null,
            chainId: config.chainId,
            textDecoder: new TextDecoder(),
            textEncoder: new TextEncoder(),
        });

        const table_rows_req = {code:config.eos.custodianContract, scope:config.eos.custodianContract, table:'config', limit:1};
        const dac_config = await api.rpc.get_table_rows(table_rows_req);

        if (dac_config.rows.length){
            const config = dac_config.rows[0];

            const dac_accounts_req = {code:'dacdirectory', scope:'dacdirectory', lower_bound:'eosdac', table:'dacs', limit:1};
            const dac_accounts = await api.rpc.get_table_rows(dac_accounts_req);
            if (dac_accounts.rows.length){
                config.accounts = dac_accounts.rows[0].accounts;
            }

            resolve(config);
        }
        else {
            reject('DAC config not found');
        }

    })


}


module.exports = function (fastify, opts, next) {
    fastify.get('/dac_config', {
        schema: dacConfigSchema.GET
    }, async (request, reply) => {
        reply.header('Access-Control-Allow-Origin', '*');
        reply.send(await getDacConfig(fastify, request));
    });
    next()
};
