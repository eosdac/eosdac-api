const {getMsigProposalsSchema} = require('../schemas');


async function getMsigProposals(fastify, request) {
    // console.log(request)


    return new Promise(async (resolve, reject) => {
        const dac_directory = await request.dac_directory();
        const dac_id = request.dac();

        const api = fastify.eos.api;
        const db = fastify.mongo.db;
        const collection = db.collection('multisigs');

        const custodian_contract = dac_directory._custodian_contracts.get(dac_id);
        const scope = (dac_id == 'eos.dac')?custodian_contract:dac_id;

        // Get current custodians
        const custodian_query = {code:custodian_contract, scope, table:'custodians', limit:100};
        const custodian_res = api.rpc.get_table_rows(custodian_query);

        const status = request.query.status || 0;
        const skip = request.query.skip || 0;
        const limit = request.query.limit || 20;

        const now = new Date();

        const query = {status, dac_id};
        if (status === 1){ // open
            query.expiration = {$gt:now};
        }
        if (status === 3){ // expired
            delete query.status;
            query.expiration = {$lt:now};
        }

        try {
            const res = collection.find(query).sort({block_num: -1}).skip(parseInt(skip)).limit(parseInt(limit));

            Promise.all([custodian_res, res]).then(async (responses) => {
                let [custodian_res, res] = responses;

                const custodians = custodian_res.rows.map((row) => row.cust_name);
                const count = await res.count();

                const proposals = {results: [], count: count};

                if (count === 0) {
                    resolve(proposals);
                } else {
                    res.forEach((msig) => {
                        delete msig._id;

                        if (msig.status === 1){ // open
                            msig.requested_approvals = msig.requested_approvals.filter((req) => custodians.includes(req.actor));
                            msig.provided_approvals = msig.provided_approvals.filter((pro) => custodians.includes(pro.actor));
                        }

                        proposals.results.push(msig);

                    }, async () => {
                        resolve(proposals);
                    })
                }
            });

        } catch (e) {
            reject(e);
        }

    })


}


module.exports = function (fastify, opts, next) {

    fastify.get('/msig_proposals', {
        schema: getMsigProposalsSchema.GET
    }, async (request, reply) => {
        reply.send(await getMsigProposals(fastify, request));
    });
    next()
};
