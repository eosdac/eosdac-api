
const {votesTimelineSchema} = require('../schemas')

const MongoLong = require('mongodb').Long;
const connectMongo = require('../connections/mongo')

const {loadConfig} = require('../functions')


async function votesTimeline(fastify, request) {
    // console.log(request)
    return new Promise(async (resolve, reject) => {
        const config = loadConfig()
        const mongo = await connectMongo(config)
        const db = mongo.db(config.mongo.dbName)
        const collection = db.collection('contract_rows')
        const account = request.query.account
        const start_block = request.query.start_block || null
        const end_block = request.query.end_block || null
        const cust_contract = config.eos.custodianContract || 'daccustodian'

        const accounts = account.split(',')

        const query = {'code':cust_contract, 'scope':cust_contract, 'table':'custodians', 'data.cust_name':{$in:accounts}}
        if (start_block){
            if (!('block_num' in query)){
                query.block_num = {}
            }
            query.block_num['$gte'] = new MongoLong(start_block)
        }
        if (end_block){
            if (!('block_num' in query)){
                query.block_num = {}
            }
            query.block_num['$lte'] = new MongoLong(end_block)
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
                        timeline.push({block_num: row.block_num, custodian:row.data.cust_name, votes: row.data.total_votes})
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
        reply.header('Access-Control-Allow-Origin', '*')
        const res = await votesTimeline(fastify, request)
        reply.send({results:res, count:res.length});
    });
    next()
};
