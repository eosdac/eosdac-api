
const connectMongo = require('./connections/mongo')
const {loadConfig} = require('./functions')

async function eosTableAtBlock({code, table, skip=0, limit=100, data_query={}, block_num=-1}){
    return new Promise(async (resolve, reject) => {
        const config = loadConfig()

        const mongo = await connectMongo(config)

        const db = mongo.db(config.mongo.dbName);

        const col = db.collection('contract_rows')

        let match = {code:code, table:table}
        let second_match = {present:1}
        // console.log(match)

        for (let col in data_query){
            second_match['data.' + col] = data_query[col]
        }

        const pipeline = [
            {'$match': match},
            {'$sort':{block_num:-1}},
            {'$group':{
                    _id: {code:"$code", table:"$table", primary_key:"$primary_key"},
                    block_num: {'$first':"$block_num"},
                    data: {'$first':"$data"},
                    table: {'$first':"$table"},
                    code: {'$first':"$code"},
                    present: {'$first':"$present"}
                }
            },
            {'$match': second_match},
            { '$sort' : {block_num:-1} },
            // { '$group': { _id: null, count: { '$sum':1 }, results: { '$push': '$$ROOT' }}}
            {'$facet': {
                results: [{ '$skip': skip }, { '$limit': limit }],
                count: [{ '$count': 'count' }]
            }}
        ]


        const filter = (err, results) => {
            if (err){
                reject(err)
                return
            }


            const ret_data = []

            results.forEach((doc) => {
                doc.results = doc.results.map((result) => {
                    delete result._id
                    delete result.present

                    return result
                })
                // console.log('COUNT', doc.count)
                doc.count = (doc.count.length)?doc.count[0].count:0;
                resolve(doc)
                // console.log("DOC", doc)
                // ret_data.push({block_num:doc.block_num, data:doc.data})
            }, () => {})
        }



        try {
            const res = col.aggregate(pipeline, filter);
        }
        catch (e) {
            console.error(e)
        }
    })
}

module.exports = eosTableAtBlock
