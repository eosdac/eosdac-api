const {transfersSchema} = require('../schemas');

const {TextDecoder, TextEncoder} = require('text-encoding');
const {Api, JsonRpc} = require('@jafri/eosjs2');
const fetch = require('node-fetch');

const {loadConfig} = require('../functions');


async function transfers(fastify, request) {
    // console.log(request)


    return new Promise(async (resolve, reject) => {
        const db = fastify.mongo.db;
        const collection = db.collection('actions');
        const dac_config = await request.dac_config();

        const skip = request.query.skip || 0;
        const limit = request.query.limit || 100;

        const token_account = dac_config.symbol.contract;
        const [precision, token_code] = dac_config.symbol.symbol.split(',');

        const transfers = {results:[], count:0};

        try {
            const query = {
                'action.account': token_account,
                'action.name': 'transfer',
                'action.data.quantity': {$regex: ` ${token_code}$`, $options:""}
            };
            const res = collection.find(query).sort({block_num: -1})
                .skip(parseInt(skip))
                .limit(parseInt(limit));
            const count = await res.count();

            res.forEach((action) => {
                delete action._id;
                transfers.results.push(action);
            }, () => {
                transfers.count = count;

                resolve(transfers);
            });
        }
        catch (e){
            fastify.log.error(`Error getting transfers ${e.message}`);
            reject(e);
        }
    });
}


module.exports = function (fastify, opts, next) {
    fastify.get('/transfers', {
        schema: transfersSchema.GET
    }, async (request, reply) => {
        reply.send(await transfers(fastify, request));
    });
    next()
};
