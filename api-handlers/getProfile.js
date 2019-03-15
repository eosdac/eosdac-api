
const {getProfileSchema} = require('../schemas')
const { NotFound } = require('http-errors')

const connectMongo = require('../connections/mongo')

const {loadConfig} = require('../functions')


async function getProfile(fastify, request) {
    const account = request.query.account

    const config = loadConfig()
    const mongo = await connectMongo(config)

    const db = mongo.db(config.mongo.dbName)
    const collection = db.collection('actions')

    const res = await collection.find({"action.account":"dacelections", "action.name":"stprofileuns", "action.data.cand":account}).sort({block_num:-1}).limit(1)

    if (await res.count()){
        const act = await res.next()

        return act.action.data.profile
    }
    else {
        return null
    }
}


module.exports = function (fastify, opts, next) {
    fastify.get('/get_profile', {
        schema: getProfileSchema.GET
    }, async (request, reply) => {
        reply.header('Access-Control-Allow-Origin', '*')
        const profile = await getProfile(fastify, request)
        if (profile){
            reply.send(profile);
        }
        else {
            throw new NotFound('Account profile not found')
        }
    });
    next()
};
