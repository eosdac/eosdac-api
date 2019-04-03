const {getMsigProposalsSchema} = require('../schemas');

const connectMongo = require('../connections/mongo');

const {loadConfig} = require('../functions');


async function getMsigProposals(fastify, request) {
    // console.log(request)


    return new Promise(async (resolve, reject) => {
        const config = loadConfig();
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
            const count = await res.count()

            if (count === 0) {
                resolve(proposals)
            } else {
                res.forEach((msig) => {
                    if (status == 1 && msig.expiration <= now){ // open and expired
                        update_expired = true;
                    }
                    else {
                        delete msig._id;
                        proposals.results.push(msig)
                    }
                }, async () => {
                    proposals.count = count;
                    resolve(proposals)

                    if (update_expired){
                        collection.updateMany({status:1, expiration: {$lt:now}}, {$set:{status:3}})
                    }
                })
            }
        } catch (e) {
            reject(e)
        }

    })


}


module.exports = function (fastify, opts, next) {
    fastify.get('/msig_proposals', {
        schema: getMsigProposalsSchema.GET
    }, async (request, reply) => {
        reply.header('Access-Control-Allow-Origin', '*');
        reply.send(await getMsigProposals(fastify, request));
    });
    next()
};
