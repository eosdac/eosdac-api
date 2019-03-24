const {getDacConfigSchema} = require('../schemas');

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

        const table_rows_req = {code:config.eos.custodianContract, scope:config.eos.custodianContract, table:'config'};
        const dac_config = await api.rpc.get_table_rows(table_rows_req);

        if (dac_config.rows.length){
            resolve(dac_config.rows[0]);
        }
        else {
            reject('DAC config not found');
        }

    })


}


module.exports = function (fastify, opts, next) {
    fastify.get('/get_dac_config', {
        schema: getDacConfigSchema.GET
    }, async (request, reply) => {
        reply.header('Access-Control-Allow-Origin', '*');
        reply.send(await getDacConfig(fastify, request));
    });
    next()
};
