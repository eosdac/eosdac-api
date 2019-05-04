const {getMsigProposalsSchema} = require('../schemas');


const {loadConfig} = require('../functions');


async function getMsigProposals(fastify, request) {
    // console.log(request)

    // console.log('fastify.eos', fastify.eos);

    return new Promise(async (resolve, reject) => {

        // Get current custodians
        const config = loadConfig();

        const api = fastify.eos.api;

        const custodian_contract = config.eos.custodianContract || 'daccustodian';

        const custodian_query = {code:custodian_contract, scope:custodian_contract, table:'custodians', limit:100};
        const custodian_res = await api.rpc.get_table_rows(custodian_query);
        const custodians = custodian_res.rows.map((row) => {
            return row.cust_name;
        });

        const db = fastify.mongo.db;
        const collection = db.collection('multisigs');

        const status = request.query.status || 0;
        const skip = request.query.skip || 0;
        const limit = request.query.limit || 20;

        const query = {status};

        try {
            const res = await collection.find(query).sort({block_num: -1}).skip(parseInt(skip)).limit(parseInt(limit));

            const proposals = {results: [], count: 0};
            let update_expired = false;
            const now = new Date();
            const count = await res.count();

            if (count === 0) {
                resolve(proposals);
            } else {
                res.forEach((msig) => {
                    if (status === 1 && msig.expiration <= now){ // open and expired
                        update_expired = true;
                    }
                    else {
                        delete msig._id;

                        if (msig.status === 1){ // open
                            msig.requested_approvals = msig.requested_approvals.filter((req) => custodians.includes(req.actor));
                            msig.provided_approvals = msig.provided_approvals.filter((pro) => custodians.includes(pro.actor));
                        }

                        proposals.results.push(msig);
                    }
                }, async () => {
                    proposals.count = count;
                    resolve(proposals);

                    if (update_expired){
                        collection.updateMany({status:1, expiration: {$lt:now}}, {$set:{status:3}});
                    }
                })
            }
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
