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
        let end_block = request.query.end_block || null;
        const cust_contract = dac_config.accounts.get(2);
        const api = fastify.eos.api;

        if (end_block && !start_block){
            throw new Error("If you specify end_block then you must also specify start_block");
        }

        let end_block_timestamp = 0;
        if (!start_block && !end_block){
            // max 6 months
            const six_months = 2 * 60 * 60 * 24 * 90;
            const info_res = await api.rpc.get_info();
            console.log("INFO : ", JSON.stringify(info_res));
            start_block = info_res.head_block_num - six_months;
            end_block = info_res.head_block_num;
            end_block_timestamp = Date.parse(info_res.head_block_time);
        }
        if (!end_block){
            const info_res = await api.rpc.get_info();
            end_block = info_res.head_block_num;
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
        const range_size = 60 * 60 * 24 * 2; // one day in blocks

        const boundaries = [];
        let block_timestamps = [];
        let current_block = end_block;
        let current_block_timestamp = end_block_timestamp;
        while (current_block >= start_block){
            boundaries.push(current_block);
            block_timestamps[current_block] = new Date(current_block_timestamp);

            current_block -= range_size;
            current_block_timestamp -= range_size * 1000;
        }

        const pipeline = [
            {$match: query},
            {'$sort': {block_num: -1}},
            {
                '$bucket': {
                    groupBy: "$block_num",
                    boundaries: boundaries.sort(),
                    default: "out_of_range",
                    output: {
                        candidate_data: {"$push": "$$ROOT.data"}
                    }
                }
            },
            { $unwind: '$candidate_data' },
            { $project: { candidate_name: '$candidate_data.candidate_name', votes: '$candidate_data.total_votes' } },
            {
                $group: {
                    _id: { name: "$candidate_name", block_num:"$_id" },
                    votes: { "$max": "$votes" }
                }
            },
            { $sort: {"_id.block_num": -1} }
        ];

        const results = [];
        const grouped_res = {};
        const res = await collection.aggregate(pipeline);
        res.forEach((row) => {
            // console.log(row);
            // delete row.candidate_data;
            if (row._id.block !== 'out_of_range'){
                const cand = row._id.name;

                grouped_res[cand] = grouped_res[cand] || [];
                // if (typeof grouped_res[cand] === 'undefined'){
                //     grouped_res[cand] = [];
                // }
                grouped_res[cand].push({
                    block_num: row._id.block_num,
                    block_timestamp: block_timestamps[row._id.block_num],
                    votes: row.votes
                });

            }
        }, () => {
            // console.log(grouped_res);

            Object.keys(grouped_res).forEach((cand) => {
                // console.log(cand);
                results.push({candidate:cand, votes: grouped_res[cand]});
            });

            resolve(results);
        });



        /*collection.find(query, {sort: {block_num: 1}}, async (err, res) => {
            // console.log("action", res.action.data)
            if (err) {
                reject(err)
            } else if (res) {
                const timeline = [];
                if (!await res.count()) {
                    resolve(timeline)
                } else {
                    const accounts = {};

                    res.forEach((row) => {
                        const cand = row.data.candidate_name;

                        if (typeof accounts[cand] === 'undefined'){
                            accounts[cand] = [];
                        }
                        accounts[cand].push({
                            block_timestamp: row.block_timestamp,
                            block_num: row.block_num,
                            votes: row.data.total_votes
                        })
                    }, () => {
                        // Group by account
                        // TODO : Probably more efficient in mongo pipeline
                        const results = [];
                        // remove rows where the previous value is the same as the current one
                        Object.keys(accounts).forEach((cand) => {
                            const votes = accounts[cand];

                            for (let i = votes.length-1; i > 0; i--){  // intentionally exclude the first document
                                if (votes[i].votes == votes[i-1].votes){
                                    votes[i].remove = true;
                                }
                            }

                            results.push({candidate:cand, votes: votes.filter(d => !d.remove)});
                        });

                        resolve(results);
                    })
                }

            }
        })*/
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
