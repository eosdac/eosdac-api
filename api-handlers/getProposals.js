const {getProposalsSchema} = require('../schemas');

const connectMongo = require('../connections/mongo');

const {loadConfig} = require('../functions');

async function getProposalData(block_num) {

    return new Promise(async (resolve, reject) => {
        const config = loadConfig();
        const mongo = await connectMongo(config);
        const db = mongo.db(config.mongo.dbName);
        const collection = db.collection('actions');


        collection.findOne({block_num, 'action.account': 'dacproposals', 'action.name': 'createprop'}, (err, res) => {
            // console.log("action", res.action.data)
            if (err) {
                reject(err)
            } else if (res && res.action) {
                resolve(res.action.data)
            } else {
                resolve(null)
            }
        })
    })

}

async function getProposals(fastify, request) {
    // console.log(request)
    const eosTableAtBlock = require('../eos-table');

    const data_query = {};

    if (typeof request.query.state !== 'undefined') {
        data_query.state = parseInt(request.query.state)
    }

    const skip = parseInt(request.query.skip) || 0;
    const limit = parseInt(request.query.limit) || 100;

    if (isNaN(skip)) {
        throw new Error(`Skip is not a number`)
    }
    if (isNaN(limit)) {
        throw new Error(`Limit is not a number`)
    }

    const res = await eosTableAtBlock({code: 'dacproposals', table: 'proposals', skip, limit, data_query});

    const return_val = [];

    for (let r = 0; r < res.results.length; r++) {
        const prop_data = res.results[r].data;
        const vote_query = {proposal_id: prop_data.key};
        const votes = await eosTableAtBlock({code: 'dacproposals', table: 'propvotes', data_query: vote_query});

        prop_data.votes = votes.results.map((val) => {
            return val.data
        });

        const action_data = await getProposalData(res.results[r].block_num);

        prop_data.title = action_data.title;
        prop_data.summary = action_data.summary;

        return_val.push(prop_data)
    }

    return {results: return_val, count: res.count}
}


module.exports = function (fastify, opts, next) {
    fastify.get('/proposals', {
        schema: getProposalsSchema.GET
    }, async (request, reply) => {
        reply.header('Access-Control-Allow-Origin', '*');
        reply.send(await getProposals(fastify, request));
    });
    next()
};
