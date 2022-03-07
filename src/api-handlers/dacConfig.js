const {dacConfigSchema} = require('../schemas');

const {TextDecoder, TextEncoder} = require('text-encoding');
const {Api, JsonRpc} = require('@jafri/eosjs2');
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

        const dac_id = request.dac();
        const dac_config_original = await request.dac_config();
        const dac_config = {
            dac_id: dac_config_original.dac_id,
            owner: dac_config_original.owner,
        };
        dac_config.config = {};
        const cust_contract = dac_config_original.accounts.get(2);

        const cust_req = {code:cust_contract, scope:dac_id, table:'config2', limit:1};
        const cust_res = await api.rpc.get_table_rows(cust_req);

        if (cust_res.rows.length){
            dac_config.config.custodian = cust_res.rows[0];
        }
        else {
            reject('DAC config not found');
        }


        resolve(dac_config);
    });
}


module.exports = function (fastify, opts, next) {
    fastify.get('/dac_config', {
        schema: dacConfigSchema.GET
    }, async (request, reply) => {
        reply.send(await getDacConfig(fastify, request));
    });
    next()
};
