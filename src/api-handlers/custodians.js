const {candidatesSchema, getPlanetCandidatesSchema} = require('../schemas');

const {TextDecoder, TextEncoder} = require('text-encoding');
const {Api, JsonRpc} = require('@jafri/eosjs2');
const fetch = require('node-fetch');

const {loadConfig, loadDacConfig} = require('../functions');
const { getMemberTerms, getSignedMemberTerms } = require('../memberterms-helper');
const { getCustodians, buildCustodianFullProfile } = require('../custodians-helper');
const { getCandidatesProfiles } = require('../candidates-helper');

async function getPlanetCustodians(fastify, request) {
    const {
        query: { walletId },
        params: { dacId },
    } = request;
    const config = loadConfig();
    const logger = require('../connections/logger')('custodians', config.logger);
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
    const custodiansLimit = 5;
    const custodians = await getCustodians(logger, api, dacId, custodiansLimit);

    if (custodians.length === 0) {
        return [];
    }
    const accounts = custodians.map(custodian => custodian.cust_name);
    const profiles = await getCandidatesProfiles(
        logger,
        db,
        dacConfig,
        dacId,
        accounts,
    );
    const termsLimit = 1;
    const terms = await getMemberTerms(logger, api, dacId, termsLimit);
    const signedTerms = await getSignedMemberTerms(logger, api, dacId, accounts);
    const result = [];
    
    for (const custodian of custodians) {
        const signed = signedTerms.get(custodian.cust_name);
        result.push(buildCustodianFullProfile(dacId, custodian, profiles.results, terms, signed));
    }

    return result;
};

module.exports = function (fastify, opts, next) {
    fastify.get('/:dacId/custodians', {
        schema: getPlanetCandidatesSchema.GET
    }, async (request, reply) => {
        reply.send(await getPlanetCustodians(fastify, request));
    });
    next()
};
