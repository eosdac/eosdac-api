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

        const dac_id = request.dac();
        const dac_config_original = await request.dac_config();
        const dac_config = {
            dac_id: dac_config_original.dac_id,
            owner: dac_config_original.owner,
            symbol: dac_config_original.symbol,
            title: dac_config_original.title,
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


        // format the refs and accounts to something understandable
        const refs_obj = {};
        refs_obj.homepage = dac_config_original.refs.get(0) || '';
        refs_obj.logo_url = dac_config_original.refs.get(1) || '';
        refs_obj.description = dac_config_original.refs.get(2) || '';
        refs_obj.logo_noext_url = dac_config_original.refs.get(3) || '';
        refs_obj.background_url = dac_config_original.refs.get(4) || '';
        refs_obj.colors = dac_config_original.refs.get(5) || {};
        refs_obj.client_extension = dac_config_original.refs.get(6) || '';
        refs_obj.other = [];

        dac_config_original.refs.forEach((val, key) => {
            if (key > 100){
                refs_obj.other.push(val);
            }
        });

        const accounts_obj = {};
        accounts_obj.auth = dac_config_original.accounts.get(0) || '';
        accounts_obj.treasury = dac_config_original.accounts.get(1) || '';
        accounts_obj.custodian = dac_config_original.accounts.get(2) || '';
        accounts_obj.msigs = dac_config_original.accounts.get(3) || '';
        accounts_obj.service = dac_config_original.accounts.get(5) || '';
        accounts_obj.proposals = dac_config_original.accounts.get(6) || '';
        accounts_obj.escrow = dac_config_original.accounts.get(7) || '';
        accounts_obj.other = [];

        dac_config_original.accounts.forEach((val, key) => {
            if (key > 100){
                accounts_obj.other.push(val);
            }
        });


        dac_config.accounts = accounts_obj;
        dac_config.refs =  refs_obj;
        // console.log(dac_config);

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
