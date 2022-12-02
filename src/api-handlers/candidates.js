const {candidatesSchema, getPlanetCandidatesSchema} = require('../schemas');

const {TextDecoder, TextEncoder} = require('text-encoding');
const {Api, JsonRpc} = require('@jafri/eosjs2');
const fetch = require('node-fetch');
const { getProfiles } = require('../profile-helper.js');

const {loadConfig, loadDacConfig} = require('../functions');
const { getMemberTerms, getSignedMemberTerms } = require('../memberterms-helper');
const { buildCandidateFullProfile, getVotedCandidates, getCandidatesProfiles, getCandidates } = require('../candidates-helper');

async function getActiveCandidates(fastify, request) {

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

        const cust_table = cust_contract === 'dao.worlds' ? 'custodians1' : 'custodians';
        const custodian_query = {code:cust_contract, scope:dac_id, table:cust_table, limit:100};
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

            const dac_id = request.dac();
            const dac_config = await request.dac_config();
            const db = fastify.mongo.db;
            let legacy = false;
            if (fastify.config.eos.legacyDacs && fastify.config.eos.legacyDacs.length && fastify.config.eos.legacyDacs.includes(dac_id)){
                fastify.log.info(`Got legacy dac ${dac_id}`, {dac_id});
                legacy = true;
            }

            const active_candidates = active.slice(skip, skip+limit);
            const accounts = active_candidates.map(c => c.candidate_name);

            const profiles = await getProfiles(db, dac_config, dac_id, accounts, legacy);

            for (let a = 0; a < active_candidates.length; a++) {
                const profile_wrapper = profiles.results.find(p => p.account === active_candidates[a].candidate_name);
                if (profile_wrapper){
                    active_candidates[a].profile = profile_wrapper.profile;
                }
            }

            resolve({results:active_candidates, count});
        }
        else {
            resolve({results:[], count: 0});
        }

    })


}

async function getPlanetCandidates(fastify, request) {
    const {
        query: { walletId },
        params: { dacId },
    } = request;
    const config = loadConfig();
    const logger = require('../connections/logger')('candidates', config.logger);
    const dacConfig = await loadDacConfig(fastify, dacId);
    const api = new Api({
        rpc: new JsonRpc(config.eos.endpoint, {fetch}),
        signatureProvider: null,
        chainId: config.chainId,
        textDecoder: new TextDecoder(),
        textEncoder: new TextEncoder(),
    });
    const db = fastify.mongo.db;
    //
    const candidatesLimit = 100;
    const candidates = await getCandidates(logger, api, dacId, candidatesLimit);
    const votedCandidates = await getVotedCandidates(logger, api, dacId, walletId);

    if (candidates.length === 0) {
        return [];
    }
    const accounts = candidates.map(candidate => candidate.candidate_name);
    const profiles = await getCandidatesProfiles(
        logger,
        db,
        dacConfig,
        dacId,
        accounts,
    );
    const termsLimit = 1;
    const terms = await getMemberTerms(logger, api, dacId, termsLimit);
    const result = [];
    const signedTerms = await getSignedMemberTerms(logger, api, dacId, accounts);

    for (const candidate of candidates) {
        const signed = signedTerms.get(candidate.candidate_name);
        result.push(buildCandidateFullProfile(dacId, candidate, profiles.results, terms, signed, votedCandidates));
    }

    return result;
};

module.exports = function (fastify, opts, next) {
    fastify.get('/candidates', {
        schema: candidatesSchema.GET
    }, async (request, reply) => {
        reply.send(await getActiveCandidates(fastify, request));
    });
    next()
};

module.exports = function (fastify, opts, next) {
    fastify.get('/:dacId/candidates', {
        schema: getPlanetCandidatesSchema.GET
    }, async (request, reply) => {
        reply.send(await getPlanetCandidates(fastify, request));
    });
    next()
};
