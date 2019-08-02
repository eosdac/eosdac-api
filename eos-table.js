const MongoLong = require('mongodb').Long;
const connectMongo = require('./connections/mongo');
const {loadConfig} = require('./functions');

async function eosTableAtBlock({db, code, table, scope = '', skip = 0, limit = 100, data_query = {}, block_num = -1, exclude_scope = false}) {
    return new Promise(async (resolve, reject) => {
        const col = db.collection('contract_rows');

        const pipeline_id = {code: "$code", table: "$table", primary_key: "$primary_key"};

        let match = {code, table};
        if (scope) {
            match.scope = scope;
        }
        if (!exclude_scope){
            pipeline_id.scope = "$scope";
        }
        if (block_num > -1) {
            match.block_num = {$lte: MongoLong.fromString(block_num + '')}
        }

        let second_match = {present: 1};
        // console.log(match)

        for (let col in data_query) {
            second_match['data.' + col] = data_query[col]
        }

        const pipeline = [
            {'$match': match},
            {'$sort': {block_num: -1, present:-1}},
            {
                '$group': {
                    _id: pipeline_id,
                    block_num: {'$first': "$block_num"},
                    data: {'$first': "$data"},
                    table: {'$first': "$table"},
                    code: {'$first': "$code"},
                    scope: {'$first': "$scope"},
                    primary_key: {'$first': "$primary_key"},
                    present: {'$first': "$present"}
                }
            },
            {'$match': second_match},
            {'$sort': {block_num: -1}},
            // { '$group': { _id: null, count: { '$sum':1 }, results: { '$push': '$$ROOT' }}}
            {
                '$facet': {
                    results: [{'$skip': skip}, {'$limit': limit}],
                    count: [{'$count': 'count'}]
                }
            }
        ];


        const filter = (err, results) => {
            if (err) {
                reject(err);
                return
            }

            results.forEach((doc) => {
                // console.log(doc);
                doc.results = doc.results.map((result) => {
                    delete result._id;
                    delete result.present;

                    return result
                });
                // console.log('COUNT', doc.count)
                doc.count = (doc.count.length) ? doc.count[0].count : 0;
                resolve(doc)
                // console.log("DOC", doc.results)
                // ret_data.push({block_num:doc.block_num, data:doc.data})
            })
        };


        try {
            col.aggregate(pipeline, {allowDiskUse: true}, filter);
        } catch (e) {
            console.error(e)
        }
    })
}

module.exports = {eosTableAtBlock};
