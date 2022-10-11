import { Api, JsonRpc } from '@jafri/eosjs2';
import { TextDecoder, TextEncoder } from 'text-encoding';

import { candidatesSchema } from '../schemas';
import { config } from '../config';
import fetch from 'node-fetch';
import { getProfiles } from '../profile-helper';

async function getCandidates(fastify, request) {
	return new Promise(async (resolve, reject) => {
		const rpc = new JsonRpc(config.eos.endpoint, { fetch });
		const api = new Api({
			rpc,
			signatureProvider: null,
			chainId: config.eos.chainId,
			textDecoder: new TextDecoder(),
			textEncoder: new TextEncoder(),
		});

		const dac_id = request.dac();
		const dac_config = await request.dac_config();
		const cust_contract = dac_config.accounts.get(2);

		const limit = request.query.limit || 20;
		const skip = request.query.skip || 0;

		const candidate_query = {
			code: cust_contract,
			scope: dac_id,
			table: 'candidates',
			limit: 100,
			key_type: 'i64',
			index_position: 3,
			reverse: true,
		};
		const candidate_res = await api.rpc.get_table_rows(candidate_query);

		const custodian_query = {
			code: cust_contract,
			scope: dac_id,
			table: 'custodians',
			limit: 100,
		};
		const custodian_res = await api.rpc.get_table_rows(custodian_query);

		const custodians_map = new Map();

		if (custodian_res.rows.length) {
			custodian_res.rows.forEach(row => {
				custodians_map.set(row.cust_name, true);
			});
		}

		if (candidate_res.rows.length) {
			const candidates = candidate_res.rows;
			const active = candidates.filter(a => a.is_active);
			active.forEach(cand => {
				cand.is_custodian = custodians_map.has(cand.candidate_name);
				if (cand.custodian_end_time_stamp === '1970-01-01T00:00:00') {
					cand.custodian_end_time_stamp = null;
				}
			});
			const count = active.length;

			const dac_id = request.dac();
			const dac_config = await request.dac_config();
			const db = fastify.mongo.db;
			let legacy = false;
			if (
				fastify.config.eos.legacyDacs &&
				fastify.config.eos.legacyDacs.length &&
				fastify.config.eos.legacyDacs.includes(dac_id)
			) {
				fastify.log.info(`Got legacy dac ${dac_id}`, { dac_id });
				legacy = true;
			}

			const active_candidates = active.slice(skip, skip + limit);
			const accounts = active_candidates.map(c => c.candidate_name);

			const profiles = await getProfiles(
				db,
				dac_config,
				dac_id,
				accounts,
				legacy
			);

			for (let a = 0; a < active_candidates.length; a++) {
				const profile_wrapper = profiles.results.find(
					p => p.account === active_candidates[a].candidate_name
				);
				if (profile_wrapper) {
					active_candidates[a].profile = profile_wrapper.profile;
				}
			}

			resolve({ results: active_candidates, count });
		} else {
			resolve({ results: [], count: 0 });
		}
	});
}

module.exports = function (fastify, opts, next) {
	fastify.get(
		'/candidates',
		{
			schema: candidatesSchema.GET,
		},
		async (request, reply) => {
			reply.send(await getCandidates(fastify, request));
		}
	);
	next();
};
