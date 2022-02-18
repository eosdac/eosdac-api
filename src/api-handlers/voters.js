const {votersSchema} = require('../schemas');


async function voters(fastify, request) {
    // console.log(request)


    return new Promise(async (resolve, reject) => {
        const dac_config = await request.dac_config();
        // console.log(dac_config);
        //console.log(dac_directory._custodian_contracts);
        const dac_id = request.dac();

        const api = fastify.eos.api;
        const db = fastify.mongo.db;
        const collection = db.collection('voters');

        const custodian_contract = dac_config.accounts.get(2);
        // const custodian_contract = 'daccustodian';

        const candidate = request.query.candidate;

        fastify.log.info(`Getting voters for ${custodian_contract}:${dac_id}:${candidate}`);

        try {
            const query = {candidate, dac_id};
            const res = await collection.findOne(query);

            if (res){
                delete res._id;
                resolve({results:[res], count:1});
            }
            else {
                resolve({results:[], count:0});
            }

        } catch (e) {
            reject(e);
        }

    })


}


module.exports = function (fastify, opts, next) {

    fastify.get('/voters', {
        schema: votersSchema.GET
    }, async (request, reply) => {
        reply.send(await voters(fastify, request));
    });
    next()
};
