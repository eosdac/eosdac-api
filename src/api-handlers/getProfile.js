const {getProfileSchema} = require('../schemas');
const {NotFound} = require('http-errors');
const {getProfiles} = require('../profile-helper.js');
const { loadConfig, loadDacConfig } = require('../functions');

async function getProfile(fastify, request) {
    const config = loadConfig();
    const { account, dac_id } = request.query;
    const dacId = dac_id || config.eos.legacyDacs[0];
    const accounts = account.split(',');
    const dacConfig = await loadDacConfig(fastify, dacId);

    const db = fastify.mongo.db;
    const token_contract = dacConfig.symbol.contract;

    let legacy = false;
    if (fastify.config.eos.legacyDacs && fastify.config.eos.legacyDacs.includes(dacId)){
        fastify.log.info(`Got legacy dac ${dacId}`, {dacName: dacId});
        legacy = true;
    }

    const result = getProfiles(db, dacConfig, dacId, accounts, legacy);


    return result
}


module.exports = function (fastify, opts, next) {
    fastify.get('/profile', {
        schema: getProfileSchema.GET
    }, async (request, reply) => {
        const profile = await getProfile(fastify, request);
        if (profile) {
            reply.send(profile);
        } else {
            throw new NotFound('Account profile not found')
        }
    });
    next()
};
