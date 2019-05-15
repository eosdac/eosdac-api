const {tokensOwnedSchema} = require('../schemas');


const MongoLong = require('mongodb').Long;

async function tokensOwned(fastify, request) {
    // console.log(request)
    return new Promise(async (resolve, reject) => {
        const db = fastify.mongo.db;
        const collection = db.collection('contract_rows');
        const account = request.query.account;

        const query = {'scope': account, 'table': 'accounts'};

        const tokens = new Map;
        const token_info = fastify.tokens();

        collection.find(query, {sort: {block_num: 1}}, async (err, res) => {
            // console.log("action", res.action.data)
            if (err) {
                reject(err)
            } else if (res) {
                const timeline = [];
                if (!await res.count()) {
                    resolve(timeline)
                } else {
                    res.forEach((row) => {
                        const [bal, sym] = row.data.balance.split(' ');
                        tokens.set(`${row.code}:${sym}`, row);
                    }, async () => {
                        const tokens_res = [];

                        tokens.forEach((value, key) => {
                            const [bal, sym] = value.data.balance.split(' ');
                            let precision = 0;
                            const decimal_pos = bal.indexOf('.');
                            if (decimal_pos > -1){
                                precision = bal.length - (decimal_pos+1);
                            }
                            const ti = token_info.get(`${value.code}:${sym}`);

                            const token_data = {
                                contract: value.code,
                                symbol: `${precision},${sym}`,
                                balance: bal,
                                logo: 'https://raw.githubusercontent.com/eoscafe/eos-airdrops/master/logos/placeholder.png',
                                logo_lg: 'https://raw.githubusercontent.com/eoscafe/eos-airdrops/master/logos/placeholder-lg.png',
                                name: sym
                            };
                            if (ti){
                                token_data.logo = ti.logo;
                                token_data.logo_lg = ti.logo_lg;
                                token_data.name = ti.name;
                            }

                            tokens_res.push(token_data);
                        });

                        resolve(tokens_res)
                    })
                }

            }
        })
    })
}


module.exports = function (fastify, opts, next) {
    fastify.get('/tokens_owned', {
        schema: tokensOwnedSchema.GET
    }, async (request, reply) => {
        const res = await tokensOwned(fastify, request);
        reply.send({results: res, count: res.length});
    });
    next()
};
