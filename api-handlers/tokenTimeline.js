
const {tokenTimelineSchema} = require('../schemas')

const MongoLong = require('mongodb').Long;
const connectMongo = require('../connections/mongo')

const {loadConfig} = require('../functions')


async function tokenTimeline(fastify, request) {
    // console.log(request)
    return new Promise(async (resolve, reject) => {
        const config = loadConfig()
        const mongo = await connectMongo(config)
        const db = mongo.db(config.mongo.dbName)
        const collection = db.collection('contract_rows')
        const account = request.query.account
        const contract = request.query.contract || 'eosdactokens'
        const symbol = request.query.symbol || 'EOSDAC'
        const start_block = request.query.start_block || null
        const end_block = request.query.end_block || null

        const query = {'code':contract, 'scope':account, 'table':'accounts'}
        if (start_block){
            if (!('block_num' in query)){
                query.block_num = {}
            }
            query.block_num['$gte'] = MongoLong.fromString(start_block)
        }
        if (end_block){
            if (!('block_num' in query)){
                query.block_num = {}
            }
            query.block_num['$lte'] = MongoLong.fromString(end_block)
        }



        collection.find(query, {sort:{block_num:1}}, async (err, res) => {
            // console.log("action", res.action.data)
            if (err){
                reject(err)
            }
            else if (res) {
                const timeline = []
                if (!await res.count()){
                    resolve(timeline)
                }
                else {
                    res.forEach((row) => {
                        const [bal, sym] = row.data.balance.split(' ')
                        if (symbol === sym){
                            timeline.push({block_num: row.block_num, balance: row.data.balance})
                        }
                    }, () => {
                        resolve(timeline)
                    })
                }

            }
        })
    })
}


module.exports = function (fastify, opts, next) {
    fastify.get('/token_timeline', {
        schema: tokenTimelineSchema.GET
    }, async (request, reply) => {
        reply.header('Access-Control-Allow-Origin', '*')
        reply.send(await tokenTimeline(fastify, request));
    });
    next()
};
