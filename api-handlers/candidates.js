const {candidatesSchema} = require('../schemas');

const {TextDecoder, TextEncoder} = require('text-encoding');
const {Api, JsonRpc} = require('@jafri/eosjs2');
const fetch = require('node-fetch');

const {loadConfig} = require('../functions');


async function getCandidates(fastify, request) {

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
        const dac_config = await request.dac_config();
        const cust_contract = dac_config.accounts.get(2);

        const limit = request.query.limit || 20;
        const skip = request.query.skip || 0;

        const candidate_query = {code:cust_contract, scope:dac_id, table:'candidates', limit:100, key_type:'i64', index_position:3, reverse:true};
        const candidate_res = await api.rpc.get_table_rows(candidate_query);


        const custodian_query = {code:cust_contract, scope:dac_id, table:'custodians', limit:100};
        const custodian_res = await api.rpc.get_table_rows(custodian_query);

        const custodians_map = new Map();

        if (custodian_res.rows.length){
            custodian_res.rows.forEach((row) => {
                custodians_map.set(row.cust_name, true);
            });
        }


        if (candidate_res.rows.length){
            const candidates = candidate_res.rows;
            // console.log(candidates)

            const active = candidates.filter(a => a.is_active);
            active.forEach((cand) => {
                cand.is_custodian = custodians_map.has(cand.candidate_name);
                if (cand.custodian_end_time_stamp === "1970-01-01T00:00:00"){
                    cand.custodian_end_time_stamp = null;
                }
            });
            const count = active.length;

            resolve({results:active.slice(skip, skip+limit), count});
        }
        else {
            reject('No candidates found');
        }

    })


}


module.exports = function (fastify, opts, next) {
    fastify.get('/candidates', {
        schema: candidatesSchema.GET
    }, async (request, reply) => {
        reply.send(await getCandidates(fastify, request));
    });
    next()
};
