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
    const custodians = await getCustodians(logger, api, dacId, 5);

    if (custodians.length === 0) {
        return [];
    }

    const profiles = await getCandidatesProfiles(
        logger,
        db,
        dacConfig,
        dacId,
        custodians.map(custodian => custodian.cust_name),
    );
    const terms = await getMemberTerms(logger, api, dacId, 1);
    const signed = await getSignedMemberTerms(logger, api, dacId, walletId);

    console.log({terms, signed})

    return custodians.map(
        custodian => buildCustodianFullProfile(dacId, custodian, profiles.results, terms, signed)
    );
};

module.exports = function (fastify, opts, next) {
    fastify.get('/:dacId/custodians', {
        schema: getPlanetCandidatesSchema.GET
    }, async (request, reply) => {
        reply.send(await getPlanetCustodians(fastify, request));
    });
    next()
};
