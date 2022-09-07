const { getProfileSchema } = require('../schemas');
const { NotFound } = require('http-errors');
const { getProfiles } = require('../profile-helper.js');
const { loadDacConfig } = require('../functions');

async function getProfile(fastify, request) {
	const {
		query: { account },
		params: { dacId },
	} = request;
	const accounts = account.split(',');
	const dacConfig = await loadDacConfig(fastify, dacId);

	const db = fastify.mongo.db;
	const token_contract = dacConfig.symbol.contract;

	let legacy = false;
	if (
		fastify.config.eos.legacyDacs &&
		fastify.config.eos.legacyDacs.includes(dacId)
	) {
		fastify.log.info(`Got legacy dac ${dacId}`, { dacName: dacId });
		legacy = true;
	}

	const result = getProfiles(db, dacConfig, dacId, accounts, legacy);

	return result;
}

module.exports = function (fastify, opts, next) {
	fastify.get(
		'/:dacId/profile',
		{
			schema: getProfileSchema.GET,
		},
		async (request, reply) => {
			const profile = await getProfile(fastify, request);
			if (profile) {
				reply.send(profile);
			} else {
				throw new NotFound('Account profile not found');
			}
		}
	);
	next();
};
