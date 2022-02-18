const {stateSchema} = require('../schemas');


async function state(fastify, request) {
    // console.log(request)


    return new Promise(async (resolve, reject) => {
        const db = fastify.mongo.db;
        const collection = db.collection('state');

        try {
            const query = {name: 'current_block'};
            const res = await collection.findOne(query);

            if (res){
                delete res._id;
                const results = {};
                results[res.name] = res.value;
                resolve({results, count:1});
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

    fastify.get('/state', {
        schema: stateSchema.GET
    }, async (request, reply) => {
        reply.send(await state(fastify, request));
    });
    next()
};
