const {votesTimelineSchema} = require('../schemas');

const MongoLong = require('mongodb').Long;

async function votesTimeline(fastify, request) {
    // console.log(request)
    return new Promise(async (resolve, reject) => {
        const dac_config = await request.dac_config();
        const dac_id = request.dac();
        const db = fastify.mongo.db;
        const collection = db.collection('contract_rows');
        const account = request.query.account;
        const start_block = request.query.start_block || null;
        const end_block = request.query.end_block || null;
        const cust_contract = dac_config.accounts.get(2);

        const accounts = account.split(',');

        const query = {
            'code': cust_contract,
            'scope': dac_id,
            'table': 'candidates',
            'data.candidate_name': {$in: accounts}
        };

        if (fastify.config.eos.legacyDacs && fastify.config.eos.legacyDacs.length && fastify.config.eos.legacyDacs.includes(dac_id)){
            fastify.log.info(`Got legacy dac ${dac_id}`, {dac_id});
            query['scope'] = {$in: [dac_id, cust_contract]};
        }

        if (start_block) {
            if (!('block_num' in query)) {
                query.block_num = {}
            }
            query.block_num['$gte'] = new MongoLong(start_block)
        }
        if (end_block) {
            if (!('block_num' in query)) {
                query.block_num = {}
            }
            query.block_num['$lte'] = new MongoLong(end_block)
        }

        // console.log(query)


        collection.find(query, {sort: {block_num: 1}}, async (err, res) => {
            // console.log("action", res.action.data)
            if (err) {
                reject(err)
            } else if (res) {
                const timeline = [];
                if (!await res.count()) {
                    resolve(timeline)
                } else {
                    res.forEach((row) => {
                        timeline.push({
                            block_num: row.block_num,
                            candidate: row.data.candidate_name,
                            votes: row.data.total_votes
                        })
                    }, () => {
                        resolve(timeline)
                    })
                }

            }
        })
    })
}


module.exports = function (fastify, opts, next) {
    fastify.get('/votes_timeline', {
        schema: votesTimelineSchema.GET
    }, async (request, reply) => {
        const res = await votesTimeline(fastify, request);
        reply.send({results: res, count: res.length});
    });
    next()
};
