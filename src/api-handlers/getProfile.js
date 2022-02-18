const {getProfileSchema} = require('../schemas');
const {NotFound} = require('http-errors');
const {eosTableAtBlock,} = require('../eos-table');
const {getProfiles} = require('../profile-helper.js');

async function getProfile(fastify, request) {
    const dac_id = request.dac();

    const account = request.query.account;
    const accounts = account.split(',');
    const dac_config = await request.dac_config();

    const db = fastify.mongo.db;

    const token_contract = dac_config.symbol.contract;

    let legacy = false;
    if (fastify.config.eos.legacyDacs && fastify.config.eos.legacyDacs.length && fastify.config.eos.legacyDacs.includes(dac_id)){
        fastify.log.info(`Got legacy dac ${dac_id}`, {dac_id});
        legacy = true;
    }

    const result = getProfiles(db, dac_config, dac_id, accounts, legacy);


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
