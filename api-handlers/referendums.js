const {referendumsSchema} = require('../schemas');

const {loadConfig} = require('../functions');

async function getReferendums(fastify, request) {

    return new Promise(async (resolve, reject) => {
        const config = loadConfig();

        const db = fastify.mongo.db;

        const now = new Date();
        const coll = db.collection('referendums');
        const res = await coll.find({status: 0, expires: {$gte:now}});

        let ret = [];
        res.forEach((row) => {
            delete row._id;

            ret.push(row);
        }, () => {
            resolve({results:ret, count:ret.length});
        });
    })

}


module.exports = function (fastify, opts, next) {
    fastify.get('/referendums', {
        schema: referendumsSchema.GET
    }, async (request, reply) => {
        reply.send(await getReferendums(fastify, request));
    });
    next()
};
