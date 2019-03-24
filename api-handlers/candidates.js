const {candidatesSchema} = require('../schemas');

const {TextDecoder, TextEncoder} = require('text-encoding');
const {Api, JsonRpc} = require('eosjs');
const fetch = require('node-fetch');

const {loadConfig} = require('../functions');
const eosTableAtBlock = require('../eos-table');


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

        const limit = request.query.limit || 20;
        const skip = request.query.skip || 0;

        const custodian_query = {code:config.eos.custodianContract, scope:config.eos.custodianContract, table:'custodians', limit:100};
        const custodian_res = await api.rpc.get_table_rows(custodian_query);
        const candidate_query = {code:config.eos.custodianContract, scope:config.eos.custodianContract, table:'candidates', limit, skip};
        // use eosTableAtBlock so we have proper pagination
        const candidate_res = await eosTableAtBlock(candidate_query);
        const custodians_map = new Map();

        if (custodian_res.rows.length){
            custodian_res.rows.forEach((row) => {
                custodians_map.set(row.cust_name, true);
            });
        }


        if (candidate_res.results.length){
            const candidates = candidate_res.results;

            const enhanced = candidates.map((row) => {
                // console.log(cand)
                const cand = row.data;
                cand.is_custodian = custodians_map.has(cand.candidate_name);

                return cand;
            });
            enhanced.sort((a, b) => {
                const a_votes = parseInt(a.total_votes);
                const b_votes = parseInt(b.total_votes);
                if (a_votes === b_votes){
                    return (a.candidate_name > b.candidate_name)?1:-1;
                }
                return (a_votes < b_votes)?1:-1;
            });
            resolve({results:enhanced, count:candidate_res.count});
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
        reply.header('Access-Control-Allow-Origin', '*');
        reply.send(await getCandidates(fastify, request));
    });
    next()
};
