
const {getProfileSchema} = require('../schemas')
const { NotFound } = require('http-errors')

const connectMongo = require('../connections/mongo')

const {loadConfig} = require('../functions')


async function getProfile(fastify, request) {
    const account = request.query.account
    const accounts = account.split(',')

    const config = loadConfig()
    const mongo = await connectMongo(config)

    const db = mongo.db(config.mongo.dbName)
    const collection = db.collection('actions')

    const cust_contract = config.eos.custodianContract || 'daccustodian'

    const query = {"action.account":cust_contract, "action.name":"stprofileuns", "action.data.cand":{$in:accounts}}

    const pipeline = [
        {$match:query},
        {'$sort':{block_num:-1}},
        {'$group':{
                _id: {cand:"$action.data.cand"},
                block_num: {'$first':"$block_num"},
                profile: {'$first':"$action.data.profile"},
                account: {'$first':"$action.data.cand"}
            }
        },
        { '$sort' : {block_num:-1} },
        {'$facet': {
                results: [ { $match: {} } ],
                count: [{ '$count': 'count' }]
            }}

    ]

    const res = await collection.aggregate(pipeline)

    const result = await res.next()
    result.results = result.results.map((row) => {
        // console.log(row.profile)
        if (typeof row.profile === 'string'){
            row.profile = JSON.parse(row.profile)
        }
        delete row._id

        return row
    })

    if (result.count.length){
        result.count = result.count[0].count
    }


    return result
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
