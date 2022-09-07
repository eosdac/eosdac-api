import { getMsigProposalsSchema } from '../schemas';

async function getMsigProposals(fastify, request) {
	// console.log(request)

	return new Promise(async (resolve, reject) => {
		const dac_config = await request.dac_config();
		//console.log(dac_directory._custodian_contracts);
		const dac_id = request.dac();

		const api = fastify.eos.api;
		const db = fastify.mongo.db;
		const collection = db.collection('multisigs');

		const custodian_contract = dac_config.accounts.get(2);
		const scope = dac_id;

		// Get current custodians
		fastify.log.info(`Getting custodians for ${custodian_contract}:${scope}`);
		const custodian_query = {
			code: custodian_contract,
			scope,
			table: 'custodians',
			limit: 100,
		};
		const custodian_res = api.rpc.get_table_rows(custodian_query);

		const status = request.query.status;
		const skip = request.query.skip || 0;
		const limit = request.query.limit || 20;
		const proposer = request.query.proposer || '';
		const proposal_name = request.query.proposal_name || '';

		const now = new Date();

		const query: any = { dac_id };
		if (typeof status !== 'undefined') {
			query.status = status;
			if (status === 1) {
				// open
				query.expiration = { $gt: now };
			}
			if (status === 3) {
				// expired
				query.status = { $ne: 0 };
				query.expiration = { $lt: now };
			}
		}

		if (proposal_name) {
			query.proposal_name = proposal_name;
		}
		if (proposer) {
			query.proposer = proposer;
		}

		try {
			console.log(`getMsigProposals query: ${JSON.stringify(query, null, 2)}`);
			const res = collection
				.find(query)
				.sort({ block_num: -1 })
				.skip(parseInt(skip))
				.limit(parseInt(limit));

			Promise.all([custodian_res, res]).then(async responses => {
				const [custodian_res, res] = responses;
				const current_custodians = custodian_res.rows.map(row => row.cust_name);
				const count = await res.count();

				const proposals = { results: [], count: count };

				if (count === 0) {
					resolve(proposals);
				} else {
					res.forEach(
						msig => {
							console.log(`msig: ${JSON.stringify(msig, null, 2)}`);
							delete msig._id;
							let custodians;

							if (status === 0) {
								// current custodians
								custodians = current_custodians;
							} else {
								custodians = msig.custodians;
							}

							// msig.requested_approvals = msig.requested_approvals.filter((req) => custodians.includes(req.actor));
							// msig.provided_approvals = msig.provided_approvals.filter((pro) => custodians.includes(pro.actor));

							if (status === 2) {
								// cancelled
								msig.status = 2;
							}

							proposals.results.push(msig);
						},
						async () => {
							resolve(proposals);
						}
					);
				}
			});
		} catch (e) {
			reject(e);
		}
	});
}

module.exports = function (fastify, opts, next) {
	fastify.get(
		'/msig_proposals',
		{
			schema: getMsigProposalsSchema.GET,
		},
		async (request, reply) => {
			reply.send(await getMsigProposals(fastify, request));
		}
	);
	next();
};
