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
            // max 3 months
            const timespan = 2 * 60 * 60 * 24 * 90;
            const info_res = await api.rpc.get_info();
            console.log("INFO : ", JSON.stringify(info_res));
            start_block = info_res.head_block_num - timespan;
            end_block = info_res.head_block_num;
            end_block_timestamp = Date.parse(info_res.head_block_time);
        }
        if (!end_block){
            const info_res = await api.rpc.get_info();
            end_block = info_res.head_block_num;
        }

        console.log(`Start: ${start_block}, End: ${end_block}, End timestamp: ${end_block_timestamp}`);

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
            current_block_timestamp -= range_size * 500;
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
            {
                $group: {
                    _id: { name: "$candidate_data.candidate_name", block_num:"$_id" },
                    votes: {"$max": "$candidate_data.total_votes"}
                }
            },
            { $sort: {"_id.block_num": -1} }
        ];

        const results = [];
        const grouped_res = {};
        const res = await collection.aggregate(pipeline);
        res.forEach((row) => {
            // console.log(row);
            if (row._id.block !== 'out_of_range'){
                const cand = row._id.name;

                grouped_res[cand] = grouped_res[cand] || [];
                grouped_res[cand].push({
                    block_num: row._id.block_num,
                    block_timestamp: block_timestamps[row._id.block_num],
                    votes: row.votes
                });

            }
        }, () => {

            Object.keys(grouped_res).forEach((cand) => {
                results.push({candidate:cand, votes: grouped_res[cand]});
            });

            resolve(results);
        });

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
