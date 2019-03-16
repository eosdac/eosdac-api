
const {tokenTimelineSchema} = require('../schemas')

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

        collection.find({'code':'kasdactokens', 'scope':account}, {sort:{block_num:1}}, async (err, res) => {
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
                        timeline.push({block_num: row.block_num, balance: row.data.balance})
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
