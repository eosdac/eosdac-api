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
        let start_block = request.query.start_block || null;
        const end_block = request.query.end_block || null;
        const cust_contract = dac_config.accounts.get(2);

        if (!start_block && !end_block){
            // max 6 months
            const six_months = 2 * 60 * 60 * 24 * 90;
            const api = fastify.eos.api;
            const info_res = await api.rpc.get_info();
            start_block = info_res.head_block_num - six_months;
        }

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
                            block_timestamp: row.block_timestamp,
                            block_num: row.block_num,
                            candidate: row.data.candidate_name,
                            votes: row.data.total_votes
                        })
                    }, () => {
                        // Group by account
                        // TODO : Probably more efficient in mongo pipeline
                        const accounts = {};
                        const results = [];
                        timeline.forEach((item) => {
                            const cand = item.candidate;
                            delete item.candidate;

                            if (typeof accounts[cand] === 'undefined'){
                                accounts[cand] = [];
                            }
                            accounts[cand].push(item);
                        });
                        // remove rows where the previous value is the same as the current one
                        Object.keys(accounts).forEach((cand) => {
                            const votes = accounts[cand];

                            for (let i = votes.length-1; i > 0; i--){  // intentionally exclude the first document
                                if (votes[i].votes == votes[i-1].votes){
                                    votes[i].remove = true;
                                }
                            }

                            results.push({candidate:cand, votes: votes.filter(d => !d.remove)});
                            // accounts[cand] = votes.filter(d => !d.remove);
                        });

                        resolve(results)
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
