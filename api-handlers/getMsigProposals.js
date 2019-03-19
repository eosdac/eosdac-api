
const MongoClient = require('mongodb').MongoClient

const {getMsigProposalsSchema} = require('../schemas')

const connectMongo = require('../connections/mongo')

const {loadConfig} = require('../functions')


async function getMsigProposals(fastify, request) {
    // console.log(request)


    return new Promise(async (resolve, reject) => {
        const config = loadConfig()
        const mongo = await connectMongo(config)
        const db = mongo.db(config.mongo.dbName)
        const collection = db.collection('multisigs')

        const status = request.query.status || 0

        const query = {status:status}

        collection.find(query, (err, res) => {
            // console.log("action", res.action.data)
            if (err){
                reject(err)
            }
            else if (res) {
                // resolve(res.action.data)
                const proposals = []
                res.forEach((msig) => {
                    proposals.push(msig)
                }, () => {
                    resolve(proposals)
                })
            }
            else {
                resolve(null)
            }
        })
    })


}


module.exports = function (fastify, opts, next) {
    fastify.get('/get_msig_proposals', {
        schema: getMsigProposalsSchema.GET
    }, async (request, reply) => {
        reply.header('Access-Control-Allow-Origin', '*')
        reply.send(await getMsigProposals(fastify, request));
    });
    next()
};
