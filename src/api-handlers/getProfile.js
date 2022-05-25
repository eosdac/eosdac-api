const {getProfileSchema} = require('../schemas');
const {NotFound} = require('http-errors');
const {getProfiles} = require('../profile-helper.js');
const { loadConfig, loadDacConfig } = require('../functions');

async function getProfile(fastify, request) {
    const config = loadConfig();
    const { account, dac_name } = request.query;
    const dacName = dac_name || config.eos.legacyDacs[0];
    const accounts = account.split(',');
    const dacConfig = await loadDacConfig(fastify, dacName);

    const db = fastify.mongo.db;
    const token_contract = dacConfig.symbol.contract;

    let legacy = false;
    if (fastify.config.eos.legacyDacs && fastify.config.eos.legacyDacs.includes(dacName)){
        fastify.log.info(`Got legacy dac ${dacName}`, {dacName});
        legacy = true;
    }

    const result = getProfiles(db, dacConfig, dacName, accounts, legacy);


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
