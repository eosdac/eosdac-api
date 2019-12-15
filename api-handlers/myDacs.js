const {myDacsSchema} = require('../schemas');
const {eosTableAtBlock} = require('../eos-table');


async function getMembershipTypes(account, db){
    const data_query = {
        account
    };
    const collection = db.collection('memberstats');
    const res = await collection.find(data_query);

    const dacs = [];
    let row;
    while (row = await res.next()){
        delete row._id;
        dacs.push(row);
    }

    return dacs;
}

async function myDacs(fastify, request) {

    return new Promise(async (resolve, reject) => {
        const dac_config = await request.dac_config();
        // console.log(dac_config);
        //console.log(dac_directory._custodian_contracts);
        const dac_id = request.dac();

        const api = fastify.eos.api;
        const db = fastify.mongo.db;
        const actions_col = db.collection('actions');

        const account = request.query.account;

        const res = await getMembershipTypes(account, db);

        resolve({results: res, count: res.length});

        // dac_data.map((row) => {
        //     console.log(row);
        //     // check for candidate
        //
        //  });



        // console.log(dac_data);

        return;

        fastify.log.info(`Getting DACs for ${account}`);

        try {
            const query = {
                "action.name": "memberrege",
                "action.data.sender": account
            };
            const res = await actions_col.find(query);

            const dacs = new Set();
            res.forEach((row) => {
                console.log(row);
                dacs.add(row.action.data.dac_id);
            }, async () => {

                const results = [];


                resolve(results);

            });

        } catch (e) {
            reject(e);
        }

    })


}


module.exports = function (fastify, opts, next) {

    fastify.get('/my_dacs', {
        schema: myDacsSchema.GET
    }, async (request, reply) => {
        reply.send(await myDacs(fastify, request));
    });
    next();
};
